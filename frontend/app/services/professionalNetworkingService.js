/**
 * Professional Networking Service
 * ==============================
 * Frontend service for AI-powered professional networking
 * - Connection suggestions based on profession
 * - AI-generated networking messages
 * - Contact management with CRM features
 * - Networking analytics and insights
 * - Event and opportunity tracking
 */

import axios from '../apimodule/axiosConfig/Axios';
import { toast } from 'react-hot-toast';
import { BehaviorSubject } from 'rxjs';
import axiosInstance from '../apimodule/axiosConfig/Axios';

class ProfessionalNetworkingService {
  constructor() {
    this.contacts = [];
    this.networkingEvents = [];
    this.opportunities = [];
    this.contactIdCounter = 0;

    // Observables for reactive state management
    this.contactsSubject = new BehaviorSubject([]);
    this.eventsSubject = new BehaviorSubject([]);
    this.opportunitiesSubject = new BehaviorSubject([]);

    // Load data from storage
    this.loadDataFromStorage();
  }

  /**
   * Get observable for contacts
   */
  getContacts$() {
    return this.contactsSubject.asObservable();
  }

  /**
   * Get observable for events
   */
  getEvents$() {
    return this.eventsSubject.asObservable();
  }

  /**
   * Get observable for opportunities
   */
  getOpportunities$() {
    return this.opportunitiesSubject.asObservable();
  }

  /**
   * Get AI-powered connection suggestions
   * @param {string} profession - User's profession
   * @param {object} preferences - User preferences for connections
   * @returns {Promise<object>} Connection suggestions
   */
  async getConnectionSuggestions(profession, preferences = {}) {
    try {
      if (!profession || profession.trim() === '') {
        throw new Error('Profession is required');
      }

      const response = await axiosInstance.post(`/api/professional-networking?profession=${profession}`, {
        profession: profession.trim(),
        preferences: {
          industries: preferences.industries || [],
          experienceLevel: preferences.experienceLevel || 'all',
          location: preferences.location || '',
          interests: preferences.interests || [],
          ...preferences
        }
      });

      if (response.status === 200) {
        const suggestions = {
          ...response.data,
          generatedAt: new Date().toISOString(),
          profession
        };

        // Cache suggestions
        this.cacheSuggestions('connections', suggestions);

        return suggestions;
      } else {
        throw new Error('Failed to get connection suggestions');
      }
    } catch (error) {
      console.error('Error getting connection suggestions:', error);
      toast.error(`Failed to get suggestions: ${error.response?.data?.detail || error.message}`);
      throw error;
    }
  }

  /**
   * Generate AI-powered networking message
   * @param {string} targetProfession - Target person's profession
   * @param {string} userProfession - User's profession
   * @param {string} context - Networking context
   * @param {object} options - Message options
   * @returns {Promise<string>} Generated message
   */
  async generateNetworkingMessage(targetProfession, userProfession, context = '', options = {}) {
    try {
      if (!targetProfession || !userProfession) {
        throw new Error('Both target and user professions are required');
      }

      const response = await axios.post('/api/professional-networking/', {
        target_profession: targetProfession.trim(),
        user_profession: userProfession.trim(),
        context: context.trim(),
        message_type: options.messageType || 'linkedin',
        tone: options.tone || 'professional',
        length: options.length || 'medium',
        include_call_to_action: options.includeCallToAction !== false
      });

      if (response.status === 200) {
        const message = response.data;
        
        // Save to message history
        this.saveMessageToHistory({
          id: Date.now(),
          targetProfession,
          userProfession,
          context,
          generatedMessage: message,
          options,
          generatedAt: new Date().toISOString()
        });

        toast.success('Message generated successfully');
        return message;
      } else {
        throw new Error('Failed to generate message');
      }
    } catch (error) {
      console.error('Error generating networking message:', error);
      toast.error(`Failed to generate message: ${error.response?.data?.detail || error.message}`);
      throw error;
    }
  }

  /**
   * Add a new contact to the network
   * @param {object} contact - Contact information
   * @returns {object} Added contact
   */
  addContact(contact) {
    try {
      this.contactIdCounter++;
      const newContact = {
        id: this.contactIdCounter,
        name: contact.name || '',
        email: contact.email || '',
        profession: contact.profession || '',
        company: contact.company || '',
        position: contact.position || '',
        location: contact.location || '',
        industry: contact.industry || '',
        linkedIn: contact.linkedIn || '',
        phone: contact.phone || '',
        notes: contact.notes || '',
        tags: contact.tags || [],
        connectionStatus: contact.connectionStatus || 'prospect', // prospect, connected, follow-up, archived
        lastContact: contact.lastContact || null,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        interactions: []
      };

      this.contacts.push(newContact);
      this.saveDataToStorage();
      this.contactsSubject.next([...this.contacts]);

      toast.success('Contact added successfully');
      return newContact;
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error('Failed to add contact');
      throw error;
    }
  }

  /**
   * Update an existing contact
   * @param {number} contactId - Contact ID
   * @param {object} updates - Contact updates
   * @returns {object} Updated contact
   */
  updateContact(contactId, updates) {
    try {
      const contactIndex = this.contacts.findIndex(c => c.id === contactId);
      if (contactIndex === -1) {
        throw new Error('Contact not found');
      }

      const updatedContact = {
        ...this.contacts[contactIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.contacts[contactIndex] = updatedContact;
      this.saveDataToStorage();
      this.contactsSubject.next([...this.contacts]);

      toast.success('Contact updated successfully');
      return updatedContact;
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
      throw error;
    }
  }

  /**
   * Delete a contact
   * @param {number} contactId - Contact ID
   * @returns {boolean} Success status
   */
  deleteContact(contactId) {
    try {
      const contactIndex = this.contacts.findIndex(c => c.id === contactId);
      if (contactIndex === -1) {
        throw new Error('Contact not found');
      }

      this.contacts.splice(contactIndex, 1);
      this.saveDataToStorage();
      this.contactsSubject.next([...this.contacts]);

      toast.success('Contact deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
      return false;
    }
  }

  /**
   * Add interaction record to a contact
   * @param {number} contactId - Contact ID
   * @param {object} interaction - Interaction details
   * @returns {object} Updated contact
   */
  addInteraction(contactId, interaction) {
    try {
      const contact = this.contacts.find(c => c.id === contactId);
      if (!contact) {
        throw new Error('Contact not found');
      }

      const newInteraction = {
        id: Date.now(),
        type: interaction.type || 'email', // email, call, meeting, message
        description: interaction.description || '',
        date: interaction.date || new Date().toISOString(),
        outcome: interaction.outcome || '', // positive, neutral, negative, follow-up-needed
        notes: interaction.notes || '',
        attachments: interaction.attachments || []
      };

      contact.interactions.push(newInteraction);
      contact.lastContact = newInteraction.date;
      contact.updatedAt = new Date().toISOString();

      this.saveDataToStorage();
      this.contactsSubject.next([...this.contacts]);

      toast.success('Interaction recorded successfully');
      return contact;
    } catch (error) {
      console.error('Error adding interaction:', error);
      toast.error('Failed to record interaction');
      throw error;
    }
  }

  /**
   * Search and filter contacts
   * @param {object} criteria - Search criteria
   * @returns {Array} Filtered contacts
   */
  searchContacts(criteria = {}) {
    return this.contacts.filter(contact => {
      if (criteria.search) {
        const search = criteria.search.toLowerCase();
        if (!contact.name.toLowerCase().includes(search) &&
            !contact.email.toLowerCase().includes(search) &&
            !contact.company.toLowerCase().includes(search) &&
            !contact.profession.toLowerCase().includes(search)) {
          return false;
        }
      }
      
      if (criteria.profession && contact.profession !== criteria.profession) return false;
      if (criteria.company && contact.company !== criteria.company) return false;
      if (criteria.industry && contact.industry !== criteria.industry) return false;
      if (criteria.location && contact.location !== criteria.location) return false;
      if (criteria.connectionStatus && contact.connectionStatus !== criteria.connectionStatus) return false;
      
      if (criteria.tags && criteria.tags.length > 0) {
        if (!criteria.tags.some(tag => contact.tags.includes(tag))) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Get networking analytics
   * @returns {object} Analytics data
   */
  getNetworkingAnalytics() {
    try {
      const totalContacts = this.contacts.length;
      const contactsByStatus = {};
      const contactsByIndustry = {};
      const contactsByLocation = {};
      const recentInteractions = [];

      this.contacts.forEach(contact => {
        // Status breakdown
        contactsByStatus[contact.connectionStatus] = 
          (contactsByStatus[contact.connectionStatus] || 0) + 1;

        // Industry breakdown
        if (contact.industry) {
          contactsByIndustry[contact.industry] = 
            (contactsByIndustry[contact.industry] || 0) + 1;
        }

        // Location breakdown
        if (contact.location) {
          contactsByLocation[contact.location] = 
            (contactsByLocation[contact.location] || 0) + 1;
        }

        // Recent interactions
        if (contact.interactions.length > 0) {
          const lastInteraction = contact.interactions[contact.interactions.length - 1];
          recentInteractions.push({
            contactName: contact.name,
            type: lastInteraction.type,
            date: lastInteraction.date,
            outcome: lastInteraction.outcome
          });
        }
      });

      // Sort recent interactions by date
      recentInteractions.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Calculate networking activity score
      const activityScore = this.calculateNetworkingActivityScore();

      return {
        totalContacts,
        contactsByStatus,
        contactsByIndustry,
        contactsByLocation,
        recentInteractions: recentInteractions.slice(0, 10),
        activityScore,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate networking activity score
   * @returns {number} Activity score (0-100)
   */
  calculateNetworkingActivityScore() {
    let score = 0;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Points for total contacts
    score += Math.min(this.contacts.length * 2, 40);

    // Points for recent interactions
    let recentInteractions = 0;
    this.contacts.forEach(contact => {
      contact.interactions.forEach(interaction => {
        if (new Date(interaction.date) > thirtyDaysAgo) {
          recentInteractions++;
        }
      });
    });
    score += Math.min(recentInteractions * 5, 30);

    // Points for contact diversity (industries)
    const industries = new Set(this.contacts.map(c => c.industry).filter(Boolean));
    score += Math.min(industries.size * 3, 20);

    // Points for follow-up consistency
    const contactsNeedingFollowUp = this.contacts.filter(contact => {
      if (contact.interactions.length === 0) return false;
      const lastInteraction = new Date(contact.interactions[contact.interactions.length - 1].date);
      const daysSinceLastContact = (now - lastInteraction) / (1000 * 60 * 60 * 24);
      return daysSinceLastContact > 14; // Follow-up needed after 2 weeks
    });
    
    const followUpRate = this.contacts.length > 0 ? 
      1 - (contactsNeedingFollowUp.length / this.contacts.length) : 1;
    score += followUpRate * 10;

    return Math.round(Math.min(score, 100));
  }

  /**
   * Get follow-up reminders
   * @returns {Array} Contacts needing follow-up
   */
  getFollowUpReminders() {
    const now = new Date();
    const followUpThreshold = 14; // days

    return this.contacts.filter(contact => {
      if (contact.interactions.length === 0) {
        // New contacts added more than 3 days ago
        const daysSinceAdded = (now - new Date(contact.addedAt)) / (1000 * 60 * 60 * 24);
        return daysSinceAdded > 3;
      }

      const lastInteraction = new Date(contact.interactions[contact.interactions.length - 1].date);
      const daysSinceLastContact = (now - lastInteraction) / (1000 * 60 * 60 * 24);
      
      return daysSinceLastContact > followUpThreshold;
    }).map(contact => ({
      ...contact,
      daysSinceLastContact: contact.interactions.length > 0 ? 
        Math.floor((now - new Date(contact.interactions[contact.interactions.length - 1].date)) / (1000 * 60 * 60 * 24)) :
        Math.floor((now - new Date(contact.addedAt)) / (1000 * 60 * 60 * 24))
    }));
  }

  /**
   * Export contacts to CSV
   * @returns {string} CSV string
   */
  exportContactsToCSV() {
    try {
      const headers = [
        'Name', 'Email', 'Profession', 'Company', 'Position', 
        'Location', 'Industry', 'LinkedIn', 'Phone', 'Connection Status', 
        'Last Contact', 'Tags', 'Notes'
      ];

      const csvData = this.contacts.map(contact => [
        contact.name,
        contact.email,
        contact.profession,
        contact.company,
        contact.position,
        contact.location,
        contact.industry,
        contact.linkedIn,
        contact.phone,
        contact.connectionStatus,
        contact.lastContact || '',
        contact.tags.join(';'),
        contact.notes.replace(/,/g, ';') // Replace commas to avoid CSV issues
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting contacts:', error);
      throw error;
    }
  }

  /**
   * Import contacts from CSV
   * @param {string} csvContent - CSV string
   * @returns {number} Number of imported contacts
   */
  importContactsFromCSV(csvContent) {
    try {
      const lines = csvContent.split('\n');
      if (lines.length < 2) {
        throw new Error('Invalid CSV format');
      }

      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      let importedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;

        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        
        if (values.length >= 3) { // At least name, email, profession
          const contact = {
            name: values[0] || '',
            email: values[1] || '',
            profession: values[2] || '',
            company: values[3] || '',
            position: values[4] || '',
            location: values[5] || '',
            industry: values[6] || '',
            linkedIn: values[7] || '',
            phone: values[8] || '',
            connectionStatus: values[9] || 'prospect',
            tags: values[11] ? values[11].split(';') : [],
            notes: values[12] || ''
          };

          this.addContact(contact);
          importedCount++;
        }
      }

      toast.success(`Imported ${importedCount} contacts successfully`);
      return importedCount;
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast.error('Failed to import contacts');
      throw error;
    }
  }

  /**
   * Cache suggestions
   */
  cacheSuggestions(type, data) {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const cacheKey = `dropshapes_networking_${type}_cache`;
      const cacheData = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache suggestions:', error);
    }
  }

  /**
   * Get cached suggestions
   */
  getCachedSuggestions(type) {
    if (typeof localStorage === 'undefined') return null;
    
    try {
      const cacheKey = `dropshapes_networking_${type}_cache`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const cacheData = JSON.parse(cached);
        if (Date.now() < cacheData.expiry) {
          return cacheData.data;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached suggestions:', error);
      return null;
    }
  }

  /**
   * Save message to history
   */
  saveMessageToHistory(message) {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const history = this.getMessageHistory();
      history.unshift(message);
      
      // Keep only last 100 messages
      if (history.length > 100) {
        history.splice(100);
      }
      
      localStorage.setItem('dropshapes_networking_messages', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save message to history:', error);
    }
  }

  /**
   * Get message history
   */
  getMessageHistory() {
    if (typeof localStorage === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('dropshapes_networking_messages');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load message history:', error);
      return [];
    }
  }

  /**
   * Load data from storage
   */
  loadDataFromStorage() {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('dropshapes_networking_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.contacts = data.contacts || [];
        this.contactIdCounter = data.contactIdCounter || 0;
        this.contactsSubject.next([...this.contacts]);
      }
    } catch (error) {
      console.error('Failed to load networking data:', error);
    }
  }

  /**
   * Save data to storage
   */
  saveDataToStorage() {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const data = {
        contacts: this.contacts,
        contactIdCounter: this.contactIdCounter,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('dropshapes_networking_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save networking data:', error);
    }
  }

  /**
   * Clear all data
   */
  clearAllData() {
    this.contacts = [];
    this.contactIdCounter = 0;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('dropshapes_networking_data');
      localStorage.removeItem('dropshapes_networking_messages');
    }
    this.contactsSubject.next([]);
    toast.success('All networking data cleared');
  }
}

// Export singleton instance
// eslint-disable-next-line import/no-anonymous-default-export
export default new ProfessionalNetworkingService();
