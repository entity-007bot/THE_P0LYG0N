import React, { useState, useEffect } from 'react';
import { Mic, X, Check, Volume2 } from 'lucide-react';
import { processVoiceIntent, createDeposit } from '../api';

export default function VoiceAssistant({ userId, onJobAccepted }) {
  const [isListening, setIsListening] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingJob, setPendingJob] = useState(null);
  const [lastResponse, setLastResponse] = useState('');
  
  const startListening = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      alert("Voice search not supported");
      return;
    }
    
    const recognition = new Recognition();
    recognition.lang = 'en-NG';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      await processVoiceCommand(transcript);
    };
    
    recognition.start();
  };
  
  const processVoiceCommand = async (transcript) => {
    try {
      const response = await processVoiceIntent(transcript, userId);
      
      // Speak response
      speak(response.speak);
      setLastResponse(response.speak);
      
      // Show confirmation if job was found
      if (response.job && response.requiresFollowUp) {
        setPendingJob(response.job);
        setShowConfirm(true);
      }
      
    } catch (err) {
      console.error(err);
      speak("Sorry, I couldn't process that.");
    }
  };
  
  const speak = (text) => {
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const confirmJob = async () => {
    if (!pendingJob) return;
    
    try {
      const response = await processVoiceIntent("yes", userId);
      speak(response.speak);
      
      // Create escrow deposit
      await createDeposit(pendingJob.id, userId);
      
      setShowConfirm(false);
      setPendingJob(null);
      
      if (onJobAccepted) onJobAccepted(pendingJob);
      
    } catch (err) {
      console.error(err);
      speak("Failed to create job deposit");
    }
  };
  
  const cancelJob = async () => {
    await processVoiceIntent("no", userId);
    setShowConfirm(false);
    setPendingJob(null);
    speak("Job skipped");
  };
  
  return (
    <>
      {/* Voice Button */}
      <button
        onClick={startListening}
        className={`fixed bottom-24 right-4 z-30 h-14 w-14 rounded-full shadow-lg transition-all ${
          isListening 
            ? 'bg-red-500 animate-pulse' 
            : 'bg-gradient-to-r from-palm to-mint hover:scale-105'
        }`}
      >
        <Mic size={24} className="mx-auto text-white" />
      </button>
      
      {/* Confirmation Modal */}
      {showConfirm && pendingJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="text-center mb-4">
              <Volume2 size={40} className="mx-auto text-palm mb-2" />
              <h3 className="text-xl font-black">Job Match Found!</h3>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="font-bold">{pendingJob.title}</p>
              <p className="text-sm text-black/60">{pendingJob.city}</p>
              <p className="text-palm font-bold mt-2">₦{pendingJob.amount}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={confirmJob}
                className="flex-1 h-12 rounded-xl bg-palm text-white font-bold"
              >
                <Check size={18} className="inline mr-2" />
                OK
              </button>
              <button
                onClick={cancelJob}
                className="flex-1 h-12 rounded-xl border border-black/15 font-bold"
              >
                <X size={18} className="inline mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Listening Indicator */}
      {isListening && (
        <div className="fixed bottom-40 right-6 bg-ink text-white rounded-full px-4 py-2 text-sm shadow-lg animate-pulse">
          🎤 Listening...
        </div>
      )}
    </>
  );
}