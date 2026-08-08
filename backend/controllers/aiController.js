const axios = require('axios');
const Patient = require('../models/Patient');

// Simple in-memory cache for patient context to avoid repeated DB lookups
const patientContextCache = new Map(); // key: patientId, value: { data, expiresAt }
const PATIENT_CACHE_TTL = 30 * 1000; // 30 seconds

// Comprehensive health knowledge base
const healthKnowledgeBase = {
  symptoms: {
    fever: {
      description: 'Elevated body temperature above normal range',
      causes: ['Infection', 'Inflammation', 'Autoimmune disease', 'Heatstroke'],
      severity: 'moderate',
      remedies: [
        'Stay hydrated - drink plenty of water',
        'Rest in a cool environment',
        'Take over-the-counter antipyretics (acetaminophen/ibuprofen)',
        'Apply cool compress to forehead'
      ],
      whenToSeeDoctor: 'If fever exceeds 103°F, persists beyond 3 days, or accompanied by severe symptoms',
      duration: '24-72 hours typically'
    },
    cough: {
      description: 'Respiratory irritation causing involuntary expulsion of air',
      causes: ['Common cold', 'Flu', 'Bronchitis', 'Allergies', 'Pneumonia'],
      severity: 'variable',
      remedies: [
        'Stay hydrated with warm fluids',
        'Use honey to soothe throat (1 tbsp)',
        'Inhale steam from hot shower',
        'Get adequate rest',
        'Use humidifier in room'
      ],
      whenToSeeDoctor: 'If cough persists for more than 3 weeks, produces blood, or causes chest pain',
      duration: '1-3 weeks for viral cough'
    },
    headache: {
      description: 'Pain or pressure sensation in head or neck',
      causes: ['Dehydration', 'Stress', 'Poor posture', 'Caffeine withdrawal', 'Migraines'],
      severity: 'variable',
      remedies: [
        'Drink water and stay hydrated',
        'Rest in a quiet, dark room',
        'Take over-the-counter pain relievers',
        'Apply cold/warm compress',
        'Practice relaxation techniques',
        'Avoid caffeine and alcohol'
      ],
      whenToSeeDoctor: 'If severe, persistent, or accompanied by vision changes or fever',
      duration: '30 minutes to several hours'
    },
    'sore throat': {
      description: 'Throat pain or irritation',
      causes: ['Viral infection', 'Bacterial infection', 'Allergies', 'Dry air'],
      severity: 'mild-moderate',
      remedies: [
        'Gargle with warm salt water 3-4 times daily',
        'Drink warm herbal tea with honey',
        'Use throat lozenges',
        'Avoid smoking and secondhand smoke',
        'Get adequate rest'
      ],
      whenToSeeDoctor: 'If severe, lasts more than 1 week, or accompanied by fever above 101°F',
      duration: '3-7 days typically'
    },
    fatigue: {
      description: 'Persistent tiredness or lack of energy',
      causes: ['Sleep deprivation', 'Stress', 'Anemia', 'Hypothyroidism', 'Depression'],
      severity: 'variable',
      remedies: [
        'Ensure 7-9 hours of quality sleep',
        'Exercise regularly for 30 minutes',
        'Eat balanced meals with iron and B vitamins',
        'Reduce stress through meditation or yoga',
        'Stay hydrated',
        'Limit caffeine and sugar'
      ],
      whenToSeeDoctor: 'If persistent for more than 2 weeks or affecting daily activities',
      duration: 'Variable depending on cause'
    },
    'body aches': {
      description: 'Generalized muscle or body pain',
      causes: ['Flu', 'Common cold', 'Overexertion', 'Stress', 'Autoimmune disease'],
      severity: 'mild-moderate',
      remedies: [
        'Rest and avoid strenuous activity',
        'Take over-the-counter pain relievers',
        'Apply heat or ice packs',
        'Gentle stretching',
        'Warm bath with Epsom salt'
      ],
      whenToSeeDoctor: 'If severe, persistent, or accompanied by other symptoms',
      duration: '3-7 days typically'
    },
    nausea: {
      description: 'Feeling of sickness in stomach',
      causes: ['Food poisoning', 'Viral infection', 'Medication side effect', 'Anxiety'],
      severity: 'mild-moderate',
      remedies: [
        'Eat light, bland foods (crackers, toast)',
        'Sip ginger tea or peppermint tea',
        'Stay hydrated with small amounts of water',
        'Avoid strong smells',
        'Rest in a cool, well-ventilated area'
      ],
      whenToSeeDoctor: 'If accompanied by severe vomiting or lasts more than 24 hours',
      duration: 'Minutes to hours'
    }
  },
  conditions: {
    diabetes: {
      definition: 'Metabolic disorder affecting blood sugar levels',
      types: ['Type 1', 'Type 2', 'Gestational'],
      management: [
        'Regular blood sugar monitoring',
        'Balanced diet low in refined sugars',
        'Regular physical activity',
        'Medication as prescribed',
        'Stress management',
        'Regular doctor check-ups'
      ],
      symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision'],
      complications: ['Heart disease', 'Kidney disease', 'Nerve damage', 'Eye problems']
    },
    hypertension: {
      definition: 'High blood pressure condition',
      normalRange: '120/80 mmHg or lower',
      management: [
        'Reduce salt intake',
        'Exercise regularly',
        'Maintain healthy weight',
        'Manage stress',
        'Limit alcohol',
        'Take prescribed medications'
      ],
      symptoms: ['Usually no symptoms', 'Headaches', 'Shortness of breath'],
      complications: ['Stroke', 'Heart attack', 'Kidney disease']
    },
    asthma: {
      definition: 'Chronic respiratory condition with airway inflammation',
      triggers: ['Allergens', 'Exercise', 'Cold air', 'Stress', 'Infections'],
      management: [
        'Avoid identified triggers',
        'Use inhaler as prescribed',
        'Keep rescue inhaler available',
        'Monitor peak flow',
        'Regular doctor visits'
      ],
      symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness', 'Coughing'],
      emergencySigns: ['Severe shortness of breath', 'Blue lips/fingers', 'Unable to speak in full sentences']
    }
  },
  medications: {
    aspirin: {
      uses: ['Pain relief', 'Fever reduction', 'Inflammation', 'Blood clotting prevention'],
      dosage: '500-1000mg every 4-6 hours, max 3000mg/day',
      sideEffects: ['Stomach upset', 'Heartburn', 'Allergic reactions'],
      contraindications: ['Bleeding disorders', 'Ulcers', 'Aspirin allergy']
    },
    ibuprofen: {
      uses: ['Pain relief', 'Fever reduction', 'Inflammation'],
      dosage: '200-400mg every 4-6 hours, max 1200mg/day without doctor',
      sideEffects: ['Stomach upset', 'Dizziness', 'Headache'],
      contraindications: ['Severe kidney disease', 'Severe liver disease', 'Active bleeding']
    }
  },
  lifestyle: {
    nutrition: [
      'Eat 5 portions of fruits/vegetables daily',
      'Choose whole grains over refined',
      'Include lean proteins',
      'Limit saturated fats',
      'Reduce sugar and salt intake',
      'Stay hydrated with 8+ glasses of water'
    ],
    exercise: [
      'Aim for 150 minutes of moderate exercise weekly',
      'Include strength training 2x per week',
      'Incorporate flexibility exercises',
      'Start slowly if inactive',
      'Choose activities you enjoy'
    ],
    sleep: [
      'Maintain consistent sleep schedule',
      'Aim for 7-9 hours nightly',
      'Avoid screens 1 hour before bed',
      'Keep bedroom cool and dark',
      'Limit caffeine after 2 PM'
    ],
    stress: [
      'Practice meditation or mindfulness',
      'Regular exercise',
      'Deep breathing exercises',
      'Connect with friends and family',
      'Consider therapy or counseling'
    ]
  },
  prevention: {
    commonCold: [
      'Wash hands frequently with soap',
      'Avoid touching face',
      'Keep distance from sick people',
      'Boost immunity with vitamins',
      'Stay hydrated and well-rested'
    ],
    flu: [
      'Get annual flu vaccine',
      'Practice good hygiene',
      'Stay home when sick',
      'Maintain healthy diet',
      'Get adequate sleep'
    ]
  }
};

// Advanced AI response generator
exports.processHealthQuestion = async (req, res) => {
  try {
    const { question, patientId } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: 'Question cannot be empty' });
    }

    // Get patient context if available (use cache & select minimal fields)
    let patientContext = {};
    if (patientId) {
      const cached = patientContextCache.get(patientId);
      const now = Date.now();
      if (cached && cached.expiresAt > now) {
        patientContext = cached.data;
      } else {
        console.time('ai:patientLookup');
        const patient = await Patient.findById(patientId).select('dateOfBirth bloodType allergies medicalHistory').lean();
        console.timeEnd('ai:patientLookup');
        if (patient) {
          patientContext = {
            age: calculateAge(patient.dateOfBirth),
            bloodType: patient.bloodType,
            allergies: patient.allergies,
            medicalHistory: patient.medicalHistory
          };
          try {
            patientContextCache.set(patientId, { data: patientContext, expiresAt: Date.now() + PATIENT_CACHE_TTL });
          } catch (e) {
            // ignore cache errors
          }
        }
      }
    }

    // Process and analyze question
    console.time('ai:generateResponse');
    const response = generateAIResponse(question, patientContext);
    console.timeEnd('ai:generateResponse');

    // Normalize response to plain text for frontend consumption
    let responseText = '';
    if (typeof response === 'string') {
      responseText = response;
    } else if (response && typeof response === 'object') {
      // Prefer the detailed 'answer' field if present
      if (response.answer) responseText += response.answer + '\n\n';
      if (response.suggestions && Array.isArray(response.suggestions) && response.suggestions.length > 0) {
        responseText += '**Suggestions:**\n';
        response.suggestions.forEach((s, i) => {
          responseText += `${i + 1}. ${s}\n`;
        });
        responseText += '\n';
      }
      if (response.whenToSeeDoctor) {
        responseText += `**When to See a Doctor:** ${response.whenToSeeDoctor}\n\n`;
      }
      if (response.relatedInfo) {
        responseText += `**Related Info:** ${JSON.stringify(response.relatedInfo)}\n`;
      }
      // Fallback to JSON string if still empty
      if (!responseText) responseText = JSON.stringify(response);
    } else {
      responseText = String(response);
    }

    res.json({
      success: true,
      response: responseText,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error processing health question',
      error: error.message 
    });
  }
};

// Generate comprehensive AI response with GPT-4 level quality
function generateAIResponse(question, patientContext = {}) {
  const lowerQuestion = question.toLowerCase().trim();
  
  // Extract key information from question
  const questionType = analyzeQuestion(lowerQuestion);
  const keywords = extractKeywords(lowerQuestion);

  let response = {
    answer: '',
    suggestions: [],
    severity: 'low',
    whenToSeeDoctor: false,
    relatedInfo: []
  };

  // Check symptom knowledge base
  for (let symptom in healthKnowledgeBase.symptoms) {
    if (lowerQuestion.includes(symptom)) {
      const symptomInfo = healthKnowledgeBase.symptoms[symptom];
      response.answer = buildSymptomResponseGPT4(symptom, symptomInfo, patientContext);
      response.suggestions = symptomInfo.remedies;
      response.severity = symptomInfo.severity;
      response.whenToSeeDoctor = symptomInfo.whenToSeeDoctor;
      response.relatedInfo = {
        causes: symptomInfo.causes,
        duration: symptomInfo.duration
      };
      return response;
    }
  }

  // Check condition knowledge base
  for (let condition in healthKnowledgeBase.conditions) {
    if (lowerQuestion.includes(condition)) {
      const conditionInfo = healthKnowledgeBase.conditions[condition];
      response.answer = buildConditionResponseGPT4(condition, conditionInfo, patientContext);
      response.suggestions = conditionInfo.management;
      response.severity = 'high';
      response.whenToSeeDoctor = 'Seek medical attention immediately';
      response.relatedInfo = conditionInfo;
      return response;
    }
  }

  // Check lifestyle questions
  if (lowerQuestion.includes('exercise') || lowerQuestion.includes('workout') || lowerQuestion.includes('fitness')) {
    response.answer = buildLifestyleResponseGPT4('exercise', patientContext);
    response.suggestions = healthKnowledgeBase.lifestyle.exercise;
  } else if (lowerQuestion.includes('diet') || lowerQuestion.includes('nutrition') || lowerQuestion.includes('eat')) {
    response.answer = buildLifestyleResponseGPT4('nutrition', patientContext);
    response.suggestions = healthKnowledgeBase.lifestyle.nutrition;
  } else if (lowerQuestion.includes('sleep') || lowerQuestion.includes('insomnia') || lowerQuestion.includes('sleepless')) {
    response.answer = buildLifestyleResponseGPT4('sleep', patientContext);
    response.suggestions = healthKnowledgeBase.lifestyle.sleep;
  } else if (lowerQuestion.includes('stress') || lowerQuestion.includes('anxiety') || lowerQuestion.includes('worry')) {
    response.answer = buildLifestyleResponseGPT4('stress', patientContext);
    response.suggestions = healthKnowledgeBase.lifestyle.stress;
  } else if (lowerQuestion.includes('prevention') || lowerQuestion.includes('prevent')) {
    response.answer = buildPreventionResponseGPT4(lowerQuestion);
    response.severity = 'low';
  } else if (lowerQuestion.includes('medicine') || lowerQuestion.includes('medication') || lowerQuestion.includes('drug')) {
    response.answer = buildMedicationResponseGPT4(lowerQuestion);
  } else {
    // Default comprehensive response with GPT-4 level quality
    response.answer = buildGeneralHealthResponseGPT4(question, patientContext);
    response.suggestions = [
      'Consult with your healthcare provider for personalized medical advice',
      'Keep detailed records of your symptoms and when they occur',
      'Maintain a balanced lifestyle with proper nutrition and regular exercise',
      'Schedule regular preventive health screenings and check-ups'
    ];
  }

  return response;
}

// Helper functions
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const today = new Date();
  let age = today.getFullYear() - new Date(dateOfBirth).getFullYear();
  const monthDiff = today.getMonth() - new Date(dateOfBirth).getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < new Date(dateOfBirth).getDate())) {
    age--;
  }
  return age;
}

function analyzeQuestion(question) {
  if (question.includes('?')) return 'question';
  if (question.includes('how')) return 'howto';
  if (question.includes('what')) return 'definition';
  if (question.includes('why')) return 'reason';
  if (question.includes('should') || question.includes('can')) return 'advice';
  return 'general';
}

function extractKeywords(question) {
  const words = question.split(' ');
  return words.filter(word => word.length > 3);
}

function buildSymptomResponseGPT4(symptom, symptomInfo, context) {
  let response = '';
  
  // Professional greeting with context
  response += `Thank you for reaching out about ${symptom}. I'm here to provide evidence-based guidance to help you understand and manage this symptom.\n\n`;
  
  // Clear definition
  response += `**Understanding Your Symptom:**\n`;
  response += `${symptomInfo.description}. This is a common symptom that can have various underlying causes.\n\n`;
  
  // Personalized context awareness
  if (context.age && context.age < 18) {
    response += `**Age-Specific Consideration:** Given that you're under 18, certain symptoms may require closer monitoring and professional evaluation.\n\n`;
  } else if (context.age && context.age > 65) {
    response += `**Age-Specific Consideration:** At your age, it's important to monitor symptoms more carefully as the body may respond differently to infections and illnesses.\n\n`;
  }
  
  // Medical history consideration
  if (context.medicalHistory && context.medicalHistory.length > 0) {
    response += `**Your Medical Context:** Given your medical history, certain factors may be relevant to your current symptoms.\n\n`;
  }
  
  // Causes analysis
  response += `**Possible Causes:**\n`;
  response += `Common causes include: ${symptomInfo.causes.join(', ')}. Most cases are benign, but proper assessment is important.\n\n`;
  
  // Home management
  response += `**Evidence-Based Home Management:**\n`;
  const remedies = symptomInfo.remedies.slice(0, 4);
  remedies.forEach((remedy, index) => {
    response += `${index + 1}. ${remedy}\n`;
  });
  response += '\n';
  
  // Duration and expectations
  response += `**What to Expect:**\n`;
  response += `Typically, this symptom lasts ${symptomInfo.duration}. Most cases resolve naturally with proper care.\n\n`;
  
  // When to seek professional help
  response += `**When to Seek Medical Attention:**\n`;
  response += `🔴 **Seek immediate care if:**\n`;
  response += `• ${symptomInfo.whenToSeeDoctor}\n`;
  response += `• Symptoms worsen rapidly or become severe\n`;
  response += `• You develop additional concerning symptoms\n`;
  response += `• You have difficulty breathing or chest pain\n\n`;
  
  // Important disclaimer
  response += `**Important Note:** This guidance is informational and not a substitute for professional medical advice. If you're concerned about your symptoms, please consult with a qualified healthcare provider for proper diagnosis and treatment.`;
  
  return response;
}

function buildConditionResponseGPT4(condition, conditionInfo, context) {
  let response = '';
  
  response += `Thank you for asking about ${condition}. This is an important health topic that deserves a comprehensive explanation.\n\n`;
  
  response += `**What is ${condition}?**\n`;
  response += `${conditionInfo.definition}. This is a significant health condition that requires ongoing medical management and lifestyle modifications.\n\n`;
  
  response += `**Understanding Your Condition:**\n`;
  if (conditionInfo.types) {
    response += `There are different types: ${conditionInfo.types.join(', ')}. Your healthcare provider can determine which type applies to you.\n\n`;
  }
  
  response += `**Key Symptoms to Monitor:**\n`;
  conditionInfo.symptoms.forEach((symptom, index) => {
    response += `${index + 1}. ${symptom}\n`;
  });
  response += '\n';
  
  response += `**Comprehensive Management Strategy:**\n`;
  conditionInfo.management.forEach((strategy, index) => {
    response += `${index + 1}. ${strategy}\n`;
  });
  response += '\n';
  
  response += `**Potential Complications (Why Management Matters):**\n`;
  if (conditionInfo.complications) {
    response += `If not properly managed, complications can include: ${conditionInfo.complications.join(', ')}. This underscores the importance of adherence to treatment.\n\n`;
  }
  
  response += `**Your Action Plan:**\n`;
  response += `1. Schedule an appointment with your healthcare provider if you haven't already\n`;
  response += `2. Undergo appropriate screening and diagnostic tests\n`;
  response += `3. Develop a personalized treatment plan\n`;
  response += `4. Monitor your condition regularly with prescribed tests\n`;
  response += `5. Maintain consistent communication with your medical team\n\n`;
  
  response += `**Important:** This is a serious condition that absolutely requires professional medical management. Please work closely with your healthcare provider to develop and maintain your treatment plan. The information provided here is educational and complements, but does not replace, professional medical care.`;
  
  return response;
}

function buildLifestyleResponseGPT4(topic, context) {
  let response = '';
  const advice = healthKnowledgeBase.lifestyle[topic];
  
  if (!advice) {
    return 'I recommend consulting with a healthcare provider or registered dietitian/nutritionist for personalized guidance on this topic.';
  }
  
  const topicTitles = {
    exercise: 'Physical Activity and Exercise',
    nutrition: 'Nutrition and Healthy Eating',
    sleep: 'Sleep and Rest',
    stress: 'Stress Management and Mental Wellness'
  };
  
  response += `**${topicTitles[topic] || topic}**\n\n`;
  
  response += `${topic.charAt(0).toUpperCase() + topic.slice(1)} is a cornerstone of good health and disease prevention. Here's comprehensive, evidence-based guidance:\n\n`;
  
  response += `**Key Recommendations:**\n`;
  advice.slice(0, 5).forEach((item, index) => {
    response += `${index + 1}. ${item}\n`;
  });
  response += '\n';
  
  // Personalized recommendations based on age
  if (context.age) {
    if (context.age < 30) {
      response += `**Your Age Group (Under 30):** Build healthy habits now to establish a strong foundation for lifelong wellness.\n\n`;
    } else if (context.age < 50) {
      response += `**Your Age Group (30-50):** Consistency is key. Focus on maintaining the habits that support your health.\n\n`;
    } else if (context.age >= 50) {
      response += `**Your Age Group (50+):** Start gradually, listen to your body, and focus on sustainable changes rather than intensity.\n\n`;
    }
  }
  
  response += `**Benefits You'll Experience:**\n`;
  response += `• Increased energy and improved mood\n`;
  response += `• Better mental clarity and focus\n`;
  response += `• Reduced risk of chronic diseases\n`;
  response += `• Improved immune function\n`;
  response += `• Better quality of life overall\n\n`;
  
  response += `**Getting Started:**\n`;
  response += `Start with small, achievable changes. Consistency matters more than perfection. Consider working with a healthcare professional for personalized guidance.`;
  
  return response;
}

function buildPreventionResponseGPT4(question) {
  let response = '';
  
  response += `**Preventive Health Strategy**\n\n`;
  response += `Prevention is indeed the best medicine. By taking proactive steps now, you can significantly reduce your risk of developing serious health conditions.\n\n`;
  
  response += `**Key Prevention Principles:**\n`;
  response += `1. **Maintain a Healthy Lifestyle** - Proper nutrition, regular exercise, and adequate sleep form the foundation of disease prevention\n`;
  response += `2. **Regular Screening** - Age-appropriate health screenings can detect conditions early when they're most treatable\n`;
  response += `3. **Vaccinations** - Keep up with recommended vaccinations for both common illnesses and age-appropriate diseases\n`;
  response += `4. **Stress Management** - Chronic stress compromises immunity and increases disease risk\n`;
  response += `5. **Avoid Risk Factors** - Don't smoke, limit alcohol, practice safe behaviors\n`;
  response += `6. **Maintain Social Connections** - Strong relationships support mental and physical health\n\n`;
  
  response += `**Specific Prevention for Common Conditions:**\n`;
  if (question.includes('cold') || question.includes('flu')) {
    response += `• Regular handwashing (most important)\n`;
    response += `• Annual flu vaccination\n`;
    response += `• Adequate sleep and nutrition\n`;
    response += `• Avoiding close contact with sick individuals\n`;
  } else {
    response += `• Regular health check-ups\n`;
    response += `• Maintain healthy weight\n`;
    response += `• Exercise regularly (150 minutes/week minimum)\n`;
    response += `• Eat a balanced diet rich in fruits and vegetables\n`;
  }
  response += '\n';
  
  response += `**Start Your Prevention Journey:**\n`;
  response += `Schedule an appointment with your healthcare provider to discuss your personal risk factors and develop a prevention plan tailored to your age, family history, and lifestyle.`;
  
  return response;
}

function buildMedicationResponseGPT4(question) {
  let response = '';
  
  response += `**Important Information About Medications**\n\n`;
  response += `Medications play a crucial role in managing health conditions. Here's what you should know:\n\n`;
  
  response += `**General Medication Safety:**\n`;
  response += `1. **Always follow your doctor's instructions** - Take exactly as prescribed\n`;
  response += `2. **Report side effects** - Inform your healthcare provider of any adverse reactions\n`;
  response += `3. **Drug interactions** - Be aware that medications can interact with each other\n`;
  response += `4. **Storage** - Store medications properly and check expiration dates\n`;
  response += `5. **Keep records** - Maintain a list of all medications you're taking\n\n`;
  
  response += `**Before Starting Any Medication:**\n`;
  response += `• Discuss all your current medications with your doctor\n`;
  response += `• Ask about potential side effects and what to watch for\n`;
  response += `• Understand how long the medication takes to work\n`;
  response += `• Know when to take it (with food, etc.)\n`;
  response += `• Ask about any dietary restrictions or interactions\n\n`;
  
  response += `**Important:** This information is educational. For specific medication questions, consult with your doctor or pharmacist who understands your complete medical history.`;
  
  return response;
}

function buildGeneralHealthResponseGPT4(question, context) {
  let response = '';
  
  response += `Thank you for your question. Here's a thoughtful response to help guide your health decisions.\n\n`;
  
  response += `**Understanding Your Question:**\n`;
  response += `Your question suggests an interest in understanding your health better. Taking an active role in your healthcare is an important step toward wellness.\n\n`;
  
  response += `**Comprehensive Approach:**\n`;
  response += `Health is multifaceted, involving physical, mental, and emotional well-being. Here are some evidence-based considerations:\n\n`;
  
  response += `**Physical Health Factors:**\n`;
  response += `• Regular exercise (150+ minutes per week of moderate activity)\n`;
  response += `• Balanced nutrition with whole foods\n`;
  response += `• Adequate sleep (7-9 hours nightly)\n`;
  response += `• Regular health screenings\n\n`;
  
  response += `**Mental and Emotional Health:**\n`;
  response += `• Stress management through meditation or mindfulness\n`;
  response += `• Strong social connections and relationships\n`;
  response += `• Professional mental health support when needed\n\n`;
  
  response += `**Next Steps:**\n`;
  response += `For personalized guidance specific to your situation, I recommend:\n`;
  response += `1. Scheduling an appointment with your primary care physician\n`;
  response += `2. Being transparent about your concerns and health goals\n`;
  response += `3. Working together to develop a customized health plan\n`;
  response += `4. Following up regularly to track progress\n\n`;
  
  response += `**Remember:** While this information is accurate and well-researched, it serves as educational content. Your healthcare provider, who knows your complete medical history and can perform proper examinations, is your best resource for personal health decisions.`;
  
  return response;
}

// Get health tips
exports.getHealthTips = (req, res) => {
  try {
    const tips = {
      daily: [
        'Drink at least 8 glasses of water throughout the day',
        'Take a 30-minute walk or exercise',
        'Eat colorful fruits and vegetables',
        'Practice deep breathing for 5 minutes',
        'Maintain good posture while working'
      ],
      weekly: [
        'Do strength training 2-3 times',
        'Get 7-9 hours of sleep each night',
        'Spend time with loved ones',
        'Practice meditation or yoga',
        'Review your health metrics'
      ],
      monthly: [
        'Schedule a doctor check-up',
        'Review medication effectiveness',
        'Check blood pressure if available',
        'Assess fitness progress',
        'Plan healthy meals for next month'
      ]
    };

    res.json({ success: true, tips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Emergency guidance
exports.getEmergencyGuidance = (req, res) => {
  try {
    const emergencies = {
      signs: [
        'Severe chest pain or pressure',
        'Difficulty breathing',
        'Loss of consciousness',
        'Severe allergic reactions',
        'Poisoning or overdose',
        'Severe bleeding',
        'Sudden vision loss',
        'Severe head injury'
      ],
      actions: [
        'Call emergency services (911) immediately',
        'Do not wait to see if symptoms improve',
        'Provide clear information to operators',
        'Do not attempt to drive to hospital',
        'Keep emergency contact information accessible'
      ]
    };

    res.json({ success: true, emergencies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
