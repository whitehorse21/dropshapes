/**
 * Services Index
 * ==============
 * Central export for all frontend services
 */

// Import all services
import textToSpeechService from './textToSpeechService';
import grammarCheckService from './grammarCheckService';
import taskManagementService from './taskManagementService';
import interviewTrainingService from './interviewTrainingService';
import professionalNetworkingService from './professionalNetworkingService';

// Export all services
export {
  textToSpeechService,
  grammarCheckService,
  taskManagementService,
  interviewTrainingService,
  professionalNetworkingService
};

// Default export with all services
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  textToSpeech: textToSpeechService,
  grammarCheck: grammarCheckService,
  taskManagement: taskManagementService,
  interviewTraining: interviewTrainingService,
  professionalNetworking: professionalNetworkingService
};

/**
 * Service Usage Examples:
 * 
 * // Import specific service
 * import { textToSpeechService } from '@/services';
 * 
 * // Import all services
 * import services from '@/services';
 * 
 * // Use service
 * const audioBlob = await textToSpeechService.synthesizeSpeech('Hello World');
 * await textToSpeechService.playAudio(audioBlob);
 * 
 * // Check grammar
 * const result = await grammarCheckService.checkGrammar('This are a test');
 * 
 * // Manage tasks
 * const task = await taskManagementService.addTask({
 *   title: 'Learn React',
 *   priority: 'high',
 *   category: 'learning'
 * });
 * 
 * // Interview training
 * const question = await interviewTrainingService.generateInterviewQuestion('JavaScript');
 * 
 * // Professional networking
 * const suggestions = await professionalNetworkingService.getConnectionSuggestions('Software Engineer');
 */
