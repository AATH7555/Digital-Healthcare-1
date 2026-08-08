import React, { useState, useEffect, useRef } from 'react';
import { FaArrowRight, FaSpinner, FaCopy, FaThumbsUp, FaThumbsDown, FaSync } from 'react-icons/fa';
import apiClient from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import './AIChat.css';

// Simple markdown formatter for better readability
const formatMarkdown = (text) => {
  if (!text) return text;
  
  // Replace **bold** with <strong>
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Replace *italic* with <em>
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Replace • with proper bullet
  text = text.replace(/•/g, '•');
  
  // Handle line breaks and list formatting
  text = text.replace(/\n/g, '<br/>');
  
  return text;
};

function AIChat({ socket, patient }) {
  const { t } = useLanguage();
  const timeoutRef = useRef(null);
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      type: 'ai',
      text: 'Hello! I\'m your Advanced Health AI Assistant powered by cutting-edge health knowledge. How can I help you today?',
      timestamp: new Date(),
      rating: null,
      helpful: false
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addAIMessage = React.useCallback((responseText) => {
    const newMessage = {
      id: Date.now(),
      type: 'ai',
      text: responseText,
      timestamp: new Date(),
      rating: null,
      helpful: false,
      suggestions: extractSuggestions(responseText)
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('ai-response', (data) => {
        if (data.success) {
          addAIMessage(data.response);
        } else {
          setError('Failed to get response. Please try again.');
        }
        setLoading(false);
      });
    }
  }, [socket, addAIMessage]);

  const extractSuggestions = (text) => {
    // Extract action items or suggestions from response
    const suggestions = [];
    if (text.includes('consult')) suggestions.push('Schedule a doctor appointment');
    if (text.includes('rest')) suggestions.push('Take adequate rest');
    if (text.includes('hydrat')) suggestions.push('Drink water regularly');
    if (text.includes('exercise')) suggestions.push('Start exercise routine');
    return suggestions.slice(0, 2);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setError('');
    setAuthError(false);
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);
    // Set a timeout to prevent infinite spinner
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setError(t('ai_response_timeout'));
    }, 15000); // 15 seconds

    try {
      const response = await apiClient.post('/ai/ask', {
        question: userMessage.text,
        patientId: patient?._id,
        patientContext: {
          age: patient?.dateOfBirth ? calculateAge(patient.dateOfBirth) : null,
          allergies: patient?.allergies,
          medicalHistory: patient?.medicalHistory,
          bloodType: patient?.bloodType
        }
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (response.data.success) {
        addAIMessage(response.data.response);
        setLoading(false);
      } else {
        setError(response.data.message || t('ai_response_failed'));
        setLoading(false);
      }
    } catch (err) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      console.error('Error:', err);
      if (err.message && (err.message.toLowerCase().includes('auth') || err.message.toLowerCase().includes('token'))) {
        setAuthError(true);
        setError(t('auth_error'));
      } else if (err.message) {
        setError(t('error_processing'));
      } else {
        setError(t('error_processing'));
      }
      setLoading(false);
    }
    // (Timeout cleanup useEffect is now at the top level, not inside this function)
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    let age = today.getFullYear() - new Date(dateOfBirth).getFullYear();
    const monthDiff = today.getMonth() - new Date(dateOfBirth).getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < new Date(dateOfBirth).getDate())) {
      age--;
    }
    return age;
  };

  const handleSuggestionClick = (suggestion) => {
    setUserInput(suggestion);
  };

  const handleRateResponse = (messageId, isHelpful) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, rating: isHelpful ? 'helpful' : 'unhelpful', helpful: isHelpful } : msg
      )
    );
  };

  const handleCopyResponse = (text) => {
    navigator.clipboard.writeText(text);
    alert(t('response_copied'));
  };

  const handleClearHistory = () => {
    if (window.confirm(t('clear_history_confirm'))) {
      setMessages([
        {
          id: Date.now(),
          type: 'ai',
          text: 'Hello! I\'m your Advanced Health AI Assistant. How can I help you today?',
          timestamp: new Date(),
          rating: null,
          helpful: false
        }
      ]);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="health-ai-module">
      <div className="ai-header">
        <h3>{t('advanced_health_ai')}</h3>
        <p className="ai-subtitle">{t('health_ai_subtitle')}</p>
        <button className="clear-history-btn" onClick={handleClearHistory} title={t('clear_chat_history')}>
          <FaSync /> {t('clear_history')}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          {authError && (
            <>
              <br />
              <span style={{ color: 'red' }}>{t('logged_out_message')}</span>
            </>
          )}
        </div>
      )}

      <div className="chat-container">
        <div className="messages-area">
          {messages.map((msg, index) => (
            <div key={msg.id} className={`message message-${msg.type}`}>
              <div className="message-header">
                <span className="message-sender">{msg.type === 'user' ? t('you') : t('ai_assistant')}</span>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="message-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} />
              
              {msg.type === 'ai' && (
                <>
                  <div className="message-actions">
                    <button
                      className={`action-btn ${msg.rating === 'helpful' ? 'active' : ''}`}
                      onClick={() => handleRateResponse(msg.id, true)}
                      title={t('mark_as_helpful')}
                    >
                      <FaThumbsUp /> {t('helpful')}
                    </button>
                    <button
                      className={`action-btn ${msg.rating === 'unhelpful' ? 'active' : ''}`}
                      onClick={() => handleRateResponse(msg.id, false)}
                      title={t('mark_as_unhelpful')}
                    >
                      <FaThumbsDown /> {t('not_helpful')}
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleCopyResponse(msg.text)}
                      title={t('copy_response')}
                    >
                      <FaCopy /> {t('copy')}
                    </button>
                  </div>
                  
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="suggestions">
                      <p className="suggestions-label">{t('suggested_actions')}</p>
                      {msg.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          className="suggestion-btn"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="message message-ai">
              <div className="message-content">
                <div className="typing-indicator">
                  <FaSpinner className="spinner" />
                  <span>{t('ai_thinking')}</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-prompts">
          <p className="prompts-label">{t('quick_questions')}</p>
          <div className="prompts-grid">
            {[t('fever_question'), t('sleep_question'), t('stress_question'), t('side_effects_question')].map((suggestion, index) => (
              <button
                key={index}
                className="quick-prompt-btn"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="chat-form">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={t('ask_health_question')}
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={loading || !userInput.trim()}>
            {loading ? <FaSpinner className="spinner" /> : <FaArrowRight />}
          </button>
        </form>
      </div>

      <div className="health-information">
        <div className="info-section">
          <h4>⚠️ Important Disclaimer</h4>
          <p>This AI assistant provides general health information only. It is not a substitute for professional medical advice. Always consult with a healthcare provider for diagnosis and treatment.</p>
        </div>
        
        <div className="info-section">
          <h4>✨ Features</h4>
          <ul>
            <li>Context-aware responses based on your health profile</li>
            <li>Comprehensive medical knowledge base</li>
            <li>Symptom analysis and guidance</li>
            <li>Personalized health recommendations</li>
            <li>Emergency warning signs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AIChat;
