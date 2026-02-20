import json
from typing import Dict, Any, List
from datetime import datetime, timedelta
import re
from app.core.config import settings
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.task import Task
from app.models.user import User

# Import AWS base service
try:
    from app.services.aws_ai_base import AWSBaseAIService
    AWS_AVAILABLE = True
except ImportError:
    AWS_AVAILABLE = False

class TaskManagementService:
    def __init__(self):
        # Initialize AWS AI service
        self.aws_ai_service = None
        if AWS_AVAILABLE and settings.USE_AWS_AI:
            try:
                self.aws_ai_service = AWSBaseAIService()
                if self.aws_ai_service.is_available():
                    print("AWS Task Management service initialized successfully")
                else:
                    raise Exception("AWS Task Management service not available")
            except Exception as e:
                print(f"Failed to initialize AWS Task Management service: {str(e)}")
                raise Exception("AWS Task Management service is required but not available")
        else:
            raise Exception("AWS Task Management service is required but not configured")

    def _get_db(self) -> Session:
        """Get database session"""
        from app.db.session import SessionLocal
        return SessionLocal()

    def add_task(self, task, user_id: int = 1):
        """Add a task to the database"""
        db = self._get_db()
        try:
            # Handle both string and dictionary inputs
            if isinstance(task, str):
                # If task is a string, create a basic task object
                task_data = {
                    "title": task,
                    "description": "",
                    "priority": "medium",
                    "status": "pending",
                    "due_date": None,
                    "category": "general",
                    "tags": [],
                    "ai_generated": False
                }
            elif isinstance(task, dict):
                # If task is already a dictionary, use it with defaults
                task_data = {
                    "title": task.get("title", ""),
                    "description": task.get("description", ""),
                    "priority": task.get("priority", "medium"),
                    "status": task.get("status", "pending"),
                    "due_date": self._parse_due_date(task.get("due_date")) if task.get("due_date") else None,
                    "category": task.get("category", "general"),
                    "tags": task.get("tags", []),
                    "ai_generated": task.get("ai_generated", False),
                    "ai_metadata": task.get("ai_metadata"),
                    "estimated_hours": task.get("estimated_hours"),
                    "complexity_rating": task.get("complexity_rating"),
                    "automation_potential": task.get("automation_potential")
                }
            else:
                raise ValueError("Task must be either a string or a dictionary")
            
            # Create database task
            db_task = Task(
                user_id=user_id,
                title=task_data["title"],
                description=task_data["description"],
                priority=task_data["priority"],
                status=task_data["status"],
                due_date=task_data["due_date"],
                category=task_data["category"],
                tags=task_data["tags"],
                ai_generated=task_data["ai_generated"],
                ai_metadata=task_data.get("ai_metadata"),
                estimated_hours=task_data.get("estimated_hours"),
                complexity_rating=task_data.get("complexity_rating"),
                automation_potential=task_data.get("automation_potential")
            )
            
            db.add(db_task)
            db.commit()
            db.refresh(db_task)
            
            # Convert to dict for response
            task_dict = {
                "id": db_task.id,
                "user_id": db_task.user_id,
                "title": db_task.title,
                "description": db_task.description,
                "priority": db_task.priority,
                "status": db_task.status,
                "due_date": db_task.due_date.isoformat() if db_task.due_date else None,
                "category": db_task.category,
                "tags": db_task.tags or [],
                "ai_generated": db_task.ai_generated,
                "created_at": db_task.created_at.isoformat(),
                "updated_at": db_task.updated_at.isoformat()
            }
            
            return {"message": "Task added successfully", "task": task_dict}
        finally:
            db.close()

    def update_task(self, task_id, updated_task, user_id: int = 1):
        """Update a task in the database"""
        db = self._get_db()
        try:
            task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
            if not task:
                return {"error": "Task not found"}
            
            # Handle both string and dictionary inputs
            if isinstance(updated_task, str):
                # If updated_task is a string, update only the title
                task.title = updated_task
            elif isinstance(updated_task, dict):
                # If updated_task is a dictionary, update the task with the provided fields
                for key, value in updated_task.items():
                    if hasattr(task, key):
                        if key == "due_date" and value:
                            setattr(task, key, self._parse_due_date(value))
                        else:
                            setattr(task, key, value)
            else:
                return {"error": "Updated task must be either a string or a dictionary"}
            
            task.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(task)
            
            # Convert to dict for response
            task_dict = {
                "id": task.id,
                "user_id": task.user_id,
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "status": task.status,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "category": task.category,
                "tags": task.tags or [],
                "ai_generated": task.ai_generated,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
            
            return {"message": "Task updated successfully", "task": task_dict}
        finally:
            db.close()

    def delete_task(self, task_id, user_id: int = 1):
        """Delete a task from the database"""
        db = self._get_db()
        try:
            task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
            if not task:
                return {"error": "Task not found"}
            
            # Convert to dict before deletion
            task_dict = {
                "id": task.id,
                "user_id": task.user_id,
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "status": task.status,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "category": task.category,
                "tags": task.tags or [],
                "ai_generated": task.ai_generated,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
            
            db.delete(task)
            db.commit()
            
            return {"message": "Task deleted successfully", "task": task_dict}
        finally:
            db.close()

    def list_tasks(self, user_id: int = 1):
        """List all tasks for a user from the database"""
        db = self._get_db()
        try:
            tasks = db.query(Task).filter(Task.user_id == user_id).all()
            
            task_list = []
            for task in tasks:
                task_dict = {
                    "id": task.id,
                    "user_id": task.user_id,
                    "title": task.title,
                    "description": task.description,
                    "priority": task.priority,
                    "status": task.status,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "category": task.category,
                    "tags": task.tags or [],
                    "ai_generated": task.ai_generated,
                    "created_at": task.created_at.isoformat(),
                    "updated_at": task.updated_at.isoformat()
                }
                task_list.append(task_dict)
            
            return {"tasks": task_list}
        finally:
            db.close()

    def get_task_by_id(self, task_id, user_id: int = 1):
        """Get a specific task by ID from the database"""
        db = self._get_db()
        try:
            task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
            if not task:
                return {"error": "Task not found"}
            
            task_dict = {
                "id": task.id,
                "user_id": task.user_id,
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "status": task.status,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "category": task.category,
                "tags": task.tags or [],
                "ai_generated": task.ai_generated,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
            
            return {"task": task_dict}
        finally:
            db.close()

    def suggest_task_prioritization(self, tasks=None, user_id: int = 1):
        """Use AWS Bedrock to suggest task prioritization"""
        try:
            if tasks is None:
                # Get tasks from database
                task_list = self.list_tasks(user_id)["tasks"]
            else:
                task_list = tasks
                
            if not task_list:
                return {"message": "No tasks available for prioritization"}
            
            # Format tasks for AI analysis with full details
            task_details = []
            for i, task in enumerate(task_list):
                task_details.append({
                    "index": i,
                    "title": task['title'],
                    "priority": task['priority'],
                    "due_date": task.get('due_date'),
                    "status": task.get('status', 'pending'),
                    "category": task.get('category', 'general'),
                    "description": task.get('description', '')
                })
            
            task_json = json.dumps(task_details, indent=2)
            
            prompt = f"""
            Analyze the following tasks and provide a prioritized order with structured reasoning. 
            Current date is {datetime.now().strftime('%Y-%m-%d')}.
            
            Tasks to analyze:
            {task_json}
            
            You must respond with ONLY a valid JSON object in this exact format:
            {{
                "prioritization_suggestions": [
                    {{
                        "title": "task title",
                        "priority": "high|medium|low",
                        "due_date": "ISO date or null",
                        "reasoning": {{
                            "urgency": "brief explanation",
                            "importance": "brief explanation", 
                            "dependencies": [],
                            "time_required": "Low|Moderate|High"
                        }}
                    }}
                ]
            }}
            
            Order tasks by recommended priority (most urgent/important first).
            Consider: deadlines, current priority, task type, and importance.
            Keep reasoning concise and actionable.
            """
            
            ai_response = self.aws_ai_service.generate_text_with_bedrock(prompt, max_tokens=800, temperature=0.3)
            
            # Try to parse the AI response as JSON
            try:
                # Clean the response - remove any markdown formatting
                cleaned_response = ai_response.strip()
                if cleaned_response.startswith('```json'):
                    cleaned_response = cleaned_response[7:]
                if cleaned_response.endswith('```'):
                    cleaned_response = cleaned_response[:-3]
                cleaned_response = cleaned_response.strip()
                
                parsed_response = json.loads(cleaned_response)
                
                # Add provider info
                parsed_response["provider"] = "aws"
                
                return parsed_response
                
            except json.JSONDecodeError as e:
                # Fallback: create structured response from the original task list
                prioritization_suggestions = []
                
                # Sort tasks by priority and due date
                sorted_tasks = sorted(task_list, key=lambda x: (
                    0 if x['priority'] == 'high' else 1 if x['priority'] == 'medium' else 2,
                    x.get('due_date') or '9999-12-31'
                ))
                
                for task in sorted_tasks:
                    suggestion = {
                        "title": task['title'],
                        "priority": task['priority'],
                        "due_date": task.get('due_date'),
                        "reasoning": {
                            "urgency": self._get_urgency_reason(task),
                            "importance": self._get_importance_reason(task),
                            "dependencies": [],
                            "time_required": "Moderate"
                        }
                    }
                    prioritization_suggestions.append(suggestion)
                
                return {
                    "provider": "aws", 
                    "prioritization_suggestions": prioritization_suggestions
                }
                
        except Exception as e:
            return {"error": f"Failed to generate prioritization suggestion: {str(e)}"}

    def analyze_productivity_patterns(self, user_id: int = 1):
        """Use AWS Bedrock to analyze task completion patterns"""
        try:
            # Get tasks from database
            all_tasks = self.list_tasks(user_id)["tasks"]
            
            # Analyze completed tasks
            completed_tasks = [task for task in all_tasks if task["status"] == "completed"]
            pending_tasks = [task for task in all_tasks if task["status"] == "pending"]
            
            if not completed_tasks:
                return {"message": "No completed tasks available for analysis"}
            
            # Create analysis data
            analysis_data = f"""
            Completed Tasks: {len(completed_tasks)}
            Pending Tasks: {len(pending_tasks)}
            
            Completed Task Categories:
            {json.dumps([task['category'] for task in completed_tasks], indent=2)}
            
            Pending Task Categories:
            {json.dumps([task['category'] for task in pending_tasks], indent=2)}
            """
            
            prompt = f"""
            Analyze the following task management data and provide insights on productivity patterns:
            
            {analysis_data}
            
            Please provide:
            1. Productivity trends and patterns
            2. Areas of strength and improvement
            3. Suggestions for better task management
            4. Time management recommendations
            5. Category-wise performance analysis
            
            Format as a structured analysis report.
            """
            
            analysis = self.aws_ai_service.generate_text_with_bedrock(prompt, max_tokens=600, temperature=0.4)
            return {
                "analysis": analysis.strip(),
                "provider": "aws",
                "stats": {
                    "completed": len(completed_tasks),
                    "pending": len(pending_tasks),
                    "completion_rate": len(completed_tasks) / (len(completed_tasks) + len(pending_tasks)) * 100 if (len(completed_tasks) + len(pending_tasks)) > 0 else 0
                }
            }
        except Exception as e:
            return {"error": f"Failed to analyze productivity patterns: {str(e)}"}

    def generate_task_suggestions(self, user_context="", user_id: int = 1):
        """Use AWS Bedrock to generate task suggestions based on context"""
        try:
            prompt = f"""
            Based on the following context, suggest relevant tasks that should be added to a task management system:
            
            Context: {user_context if user_context else "General productivity and professional development"}
            
            Please suggest:
            1. Daily tasks for productivity
            2. Weekly goals and milestones
            3. Professional development activities
            4. Personal organization tasks
            5. Health and wellness activities
            
            For each suggestion, include:
            - Task title
            - Brief description
            - Suggested priority (low/medium/high)
            - Estimated time required
            - Category (work/personal/health/learning)
            
            Format as a structured list.
            """
            
            suggestions = self.aws_ai_service.generate_text_with_bedrock(prompt, max_tokens=800, temperature=0.7)
            return {
                "suggestions": suggestions.strip(),
                "provider": "aws"
            }
        except Exception as e:
            return {"error": f"Failed to generate task suggestions: {str(e)}"}

    async def quick_task_entry(self, task_input: str, user_id: int = 1) -> Dict[str, Any]:
        """
        AI-powered quick task entry that parses natural language input 
        and extracts task details like title, priority, due date, and category
        """
        try:
            prompt = f"""
            Parse the following natural language task input and extract structured task information:
            
            Input: "{task_input}"
            
            Extract and return a JSON object with the following fields:
            - title: A clean, concise task title (required)
            - description: A more detailed description if available (optional)
            - priority: One of [low, medium, high, urgent] based on urgency indicators
            - due_date: ISO date string if a date/deadline is mentioned (YYYY-MM-DD format)
            - category: Best matching category from [work, personal, health, learning, shopping, meeting, project, urgent, routine]
            - tags: Array of relevant tags/keywords for the task
            
            Examples of inputs and expected extractions:
            - "Buy groceries tomorrow" → priority: medium, due_date: tomorrow's date, category: shopping
            - "Urgent: Finish project report by Friday" → priority: urgent, due_date: next Friday, category: work
            - "Schedule dentist appointment" → priority: medium, category: health
            - "Learn Python for 1 hour" → priority: medium, category: learning
            
            IMPORTANT: Return ONLY a valid JSON object without any markdown formatting, code blocks, or comments. 
            Do not include ```json or ``` or // comments in your response.
            
            Current date for reference: {datetime.now().strftime('%Y-%m-%d')}
            """
            
            ai_response = self.aws_ai_service.generate_text_with_bedrock(
                prompt, 
                max_tokens=400, 
                temperature=0.3
            )
            
            # Clean and parse the AI response
            cleaned_response = self._clean_ai_response(ai_response)
            print(f"Debug - AI Response: {ai_response[:200]}...")
            print(f"Debug - Cleaned Response: {cleaned_response}")
            
            try:
                parsed_task = json.loads(cleaned_response)
                print(f"Debug - Parsed Task: {parsed_task}")
                
                # Validate and set defaults
                due_date_raw = parsed_task.get("due_date")
                due_date_parsed = self._parse_due_date(due_date_raw)
                print(f"Debug - Due date raw: {due_date_raw}, parsed: {due_date_parsed}")
                
                task_data = {
                    "title": parsed_task.get("title", task_input)[:255],  # Truncate if too long
                    "description": parsed_task.get("description", "")[:1000],
                    "priority": parsed_task.get("priority", "medium"),
                    "status": "pending",
                    "due_date": due_date_parsed,
                    "category": parsed_task.get("category", "general"),
                    "tags": parsed_task.get("tags", []),
                    "ai_generated": True,
                    "ai_metadata": {
                        "original_input": task_input,
                        "extracted_fields": parsed_task,
                        "confidence": "high" if len(parsed_task) >= 3 else "medium"
                    }
                }
                
                # Add the task to the database
                result = self.add_task(task_data, user_id)
                result["ai_parsing"] = task_data["ai_metadata"]
                
                return result
                
            except json.JSONDecodeError as e:
                print(f"Debug - JSON Parse Error: {e}")
                print(f"Debug - Failed to parse: {cleaned_response}")
                # Fallback: create basic task with AI-suggested improvements
                return self._create_fallback_task(task_input, f"JSON Parse Error: {str(e)} - Response: {cleaned_response}", user_id)
                
        except Exception as e:
            # Fallback: create basic task without AI
            return self._create_fallback_task(task_input, str(e), user_id)

    async def intelligent_deadline_recommendations(self, task_title: str, task_description: str = "", 
                                                  task_category: str = "general", 
                                                  task_priority: str = "medium", user_id: int = 1) -> Dict[str, Any]:
        """
        AI-powered deadline recommendations based on task complexity, 
        type, priority, and current workload
        """
        try:
            # Analyze current workload from database
            all_tasks = self.list_tasks(user_id)["tasks"]
            pending_tasks = [task for task in all_tasks if task["status"] in ["pending", "in_progress"]]
            
            workload_analysis = {
                "total_pending": len(pending_tasks),
                "urgent_tasks": len([t for t in pending_tasks if t["priority"] == "urgent"]),
                "high_priority": len([t for t in pending_tasks if t["priority"] == "high"]),
                "upcoming_deadlines": [
                    t for t in pending_tasks 
                    if t.get("due_date") and self._parse_due_date(t["due_date"]) 
                    and self._parse_due_date(t["due_date"]) <= datetime.now() + timedelta(days=7)
                ]
            }
            
            # Calculate some reference dates for the AI
            today = datetime.now()
            next_week = today + timedelta(days=7)
            next_month = today + timedelta(days=30)
            
            prompt = f"""
            Analyze the following task and recommend optimal deadlines based on complexity, urgency, and current workload:
            
            IMPORTANT CONTEXT:
            - Today's date: {today.strftime('%Y-%m-%d')} (Current year is {today.year})
            - Next week date: {next_week.strftime('%Y-%m-%d')}
            - Next month date: {next_month.strftime('%Y-%m-%d')}
            - ALL DEADLINES MUST BE IN THE FUTURE (after {today.strftime('%Y-%m-%d')})
            
            Task Details:
            - Title: {task_title}
            - Description: {task_description}
            - Category: {task_category}
            - Priority: {task_priority}
            
            Current Workload:
            - Total pending tasks: {workload_analysis['total_pending']}
            - Urgent tasks: {workload_analysis['urgent_tasks']}
            - High priority tasks: {workload_analysis['high_priority']}
            - Tasks due in next 7 days: {len(workload_analysis['upcoming_deadlines'])}
            
            Based on task complexity analysis, provide recommendations as a JSON object:
            {{
                "recommended_deadline": "YYYY-MM-DD",
                "alternative_deadlines": [
                    {{"date": "YYYY-MM-DD", "label": "Conservative estimate"}},
                    {{"date": "YYYY-MM-DD", "label": "Aggressive timeline"}},
                    {{"date": "YYYY-MM-DD", "label": "Balanced approach"}}
                ],
                "estimated_hours": number,
                "complexity_rating": "low|medium|high",
                "reasoning": "Explanation for deadline recommendation",
                "workload_impact": "low|medium|high",
                "suggestions": [
                    "Actionable suggestions for meeting the deadline"
                ]
            }}
            
            DEADLINE CALCULATION GUIDELINES:
            - For urgent tasks: 1-3 days from today ({today.strftime('%Y-%m-%d')})
            - For high priority: 3-7 days from today
            - For medium priority: 1-2 weeks from today
            - For low priority: 2-4 weeks from today
            - For complex tasks: Add 1-2 weeks buffer
            - Always use {today.year} as the year in all dates
            
            Consider:
            1. Task complexity based on title and description
            2. Category-specific typical durations
            3. Priority level urgency
            4. Current workload and competing deadlines
            5. Buffer time for unexpected delays
            
            CRITICAL: Ensure all dates are in {today.year} and are future dates after {today.strftime('%Y-%m-%d')}.
            Return only the JSON object without markdown formatting.
            """
            
            ai_response = self.aws_ai_service.generate_text_with_bedrock(
                prompt, 
                max_tokens=600, 
                temperature=0.4
            )
            
            cleaned_response = self._clean_ai_response(ai_response)
            print(f"Debug - Deadline AI Response: {ai_response[:300]}...")
            print(f"Debug - Deadline Cleaned Response: {cleaned_response}")
            
            try:
                recommendations = json.loads(cleaned_response)
                
                # Validate and fix dates to ensure they're in current year and future
                current_year = datetime.now().year
                today = datetime.now().date()
                
                def validate_and_fix_date(date_str):
                    """Ensure date is in current year and in the future"""
                    try:
                        if isinstance(date_str, str) and re.match(r'\d{4}-\d{2}-\d{2}', date_str):
                            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                            
                            # If date is in the past or wrong year, adjust it
                            if date_obj.year != current_year or date_obj <= today:
                                # Keep the month and day, but use current year
                                adjusted_date = date_obj.replace(year=current_year)
                                
                                # If still in the past, move to next year
                                if adjusted_date <= today:
                                    adjusted_date = adjusted_date.replace(year=current_year + 1)
                                
                                return adjusted_date.strftime('%Y-%m-%d')
                            
                            return date_str
                    except:
                        pass
                    
                    # Fallback: return a default future date
                    return (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
                
                # Fix the main deadline
                if 'recommended_deadline' in recommendations:
                    original_deadline = recommendations['recommended_deadline']
                    recommendations['recommended_deadline'] = validate_and_fix_date(recommendations['recommended_deadline'])
                    print(f"Debug - Fixed main deadline: {original_deadline} -> {recommendations['recommended_deadline']}")
                
                # Fix alternative deadlines
                if 'alternative_deadlines' in recommendations and isinstance(recommendations['alternative_deadlines'], list):
                    for deadline in recommendations['alternative_deadlines']:
                        if isinstance(deadline, dict) and 'date' in deadline:
                            original_date = deadline['date']
                            deadline['date'] = validate_and_fix_date(deadline['date'])
                            print(f"Debug - Fixed alternative deadline: {original_date} -> {deadline['date']}")
                
                # Validate and enhance recommendations
                recommendations["generated_at"] = datetime.now().isoformat()
                recommendations["workload_context"] = workload_analysis
                
                return {
                    "success": True,
                    "recommendations": recommendations,
                    "provider": "aws"
                }
                
            except json.JSONDecodeError:
                return {
                    "success": False,
                    "error": "Failed to parse AI recommendations",
                    "raw_response": cleaned_response[:500],
                    "fallback_deadline": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to generate deadline recommendations: {str(e)}",
                "fallback_deadline": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
            }

    async def smart_task_categorization_and_tagging(self, task_title: str, 
                                                   task_description: str = "", user_id: int = 1) -> Dict[str, Any]:
        """
        AI-powered task categorization and intelligent tagging based on content analysis
        """
        try:
            # Analyze existing task categories and tags for context from database
            all_tasks = self.list_tasks(user_id)["tasks"]
            existing_categories = list(set([task.get("category", "general") for task in all_tasks]))
            existing_tags = []
            for task in all_tasks:
                if task.get("tags") and isinstance(task["tags"], list):
                    existing_tags.extend(task["tags"])
            unique_tags = list(set(existing_tags))
            
            prompt = f"""
            Analyze the following task and provide intelligent categorization and tagging:
            
            Task Title: {task_title}
            Task Description: {task_description}
            
            Context - Existing categories in system: {existing_categories[:20]}
            Context - Popular existing tags: {unique_tags[:30]}
            
            Provide analysis as a JSON object:
            {{
                "recommended_category": "Best fitting category",
                "category_confidence": 0.95,
                "alternative_categories": [
                    {{"category": "alternative1", "confidence": 0.85}},
                    {{"category": "alternative2", "confidence": 0.75}}
                ],
                "recommended_tags": [
                    "relevant", "tags", "for", "organization"
                ],
                "tag_explanations": {{
                    "tag1": "Why this tag is relevant",
                    "tag2": "Why this tag helps organization"
                }},
                "task_type": "meeting|project|routine|creative|administrative|urgent|research",
                "estimated_duration": "30 minutes|2 hours|1 day|1 week",
                "related_concepts": ["concept1", "concept2"],
                "priority_indicators": [
                    "Factors that suggest priority level"
                ],
                "automation_potential": "low|medium|high",
                "dependencies": [
                    "Potential dependencies or prerequisites"
                ]
            }}
            
            Categories to consider:
            - work, personal, health, learning, shopping, meeting, project, urgent, routine, creative, 
            - administrative, financial, travel, home, family, social, fitness, career, education
            
            Tag guidelines:
            - Use 3-8 relevant tags
            - Include both general and specific tags
            - Consider context, urgency, tools needed, location, people involved
            - Reuse existing tags when appropriate for consistency
            
            Return only the JSON object.
            """
            
            ai_response = self.aws_ai_service.generate_text_with_bedrock(
                prompt, 
                max_tokens=700, 
                temperature=0.5
            )
            
            cleaned_response = self._clean_ai_response(ai_response)
            
            try:
                analysis = json.loads(cleaned_response)
                
                # Enhance with additional metadata
                analysis["analysis_timestamp"] = datetime.now().isoformat()
                analysis["context_used"] = {
                    "existing_categories_count": len(existing_categories),
                    "existing_tags_count": len(unique_tags),
                    "task_length": len(task_title) + len(task_description)
                }
                
                return {
                    "success": True,
                    "analysis": analysis,
                    "provider": "aws"
                }
                
            except json.JSONDecodeError:
                # Fallback categorization
                return self._fallback_categorization(task_title, task_description)
                
        except Exception as e:
            return self._fallback_categorization(task_title, task_description, str(e))

    def _clean_ai_response(self, response: str) -> str:
        """Clean AI response to extract JSON content"""
        # Remove common AI response prefixes/suffixes
        response = response.strip()
        
        # Remove markdown code blocks
        if response.startswith('```json'):
            response = response[7:]  # Remove ```json
        elif response.startswith('```'):
            response = response[3:]   # Remove ```
            
        if response.endswith('```'):
            response = response[:-3]  # Remove trailing ```
            
        response = response.strip()
        
        # Remove JSON comments (// comments)
        lines = response.split('\n')
        cleaned_lines = []
        for line in lines:
            # Remove inline comments
            comment_idx = line.find('//')
            if comment_idx != -1:
                line = line[:comment_idx].rstrip()
            
            # Skip empty lines that result from comment removal
            if line.strip():
                cleaned_lines.append(line)
        
        response = '\n'.join(cleaned_lines)
        
        # Find JSON content between curly braces
        start_idx = response.find('{')
        end_idx = response.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            return response[start_idx:end_idx + 1]
        
        return response

    def _parse_due_date(self, date_str: Any):
        """Parse and validate due date string, return datetime object"""
        if not date_str:
            return None
            
        try:
            if isinstance(date_str, datetime):
                return date_str
            elif isinstance(date_str, str):
                date_str = date_str.strip().lower()
                
                # Handle relative dates
                if "tomorrow" in date_str:
                    return (datetime.now() + timedelta(days=1)).replace(hour=23, minute=59, second=59)
                elif "today" in date_str:
                    return datetime.now().replace(hour=23, minute=59, second=59)
                elif "next week" in date_str:
                    return (datetime.now() + timedelta(days=7)).replace(hour=23, minute=59, second=59)
                elif "next month" in date_str:
                    return (datetime.now() + timedelta(days=30)).replace(hour=23, minute=59, second=59)
                
                # Handle ISO format dates
                if re.match(r'\d{4}-\d{2}-\d{2}', date_str):
                    try:
                        # Parse date and set to end of day
                        parsed_date = datetime.strptime(date_str[:10], "%Y-%m-%d")
                        return parsed_date.replace(hour=23, minute=59, second=59)
                    except ValueError:
                        pass
                
                # Try to parse other formats using dateutil if available
                try:
                    from dateutil.parser import parse
                    parsed_date = parse(date_str)
                    # If only date provided, set to end of day
                    if parsed_date.hour == 0 and parsed_date.minute == 0 and parsed_date.second == 0:
                        parsed_date = parsed_date.replace(hour=23, minute=59, second=59)
                    return parsed_date
                except (ImportError, ValueError):
                    # Fallback: try basic datetime parsing
                    try:
                        return datetime.strptime(date_str, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
                    except ValueError:
                        pass
            
            return None
        except Exception as e:
            print(f"Date parsing error: {e}")
            return None

    def _create_fallback_task(self, task_input: str, error_info: str = "", user_id: int = 1) -> Dict[str, Any]:
        """Create a basic task when AI parsing fails"""
        task_data = {
            "title": task_input[:255],
            "description": "",
            "priority": "medium",
            "status": "pending",
            "due_date": None,
            "category": "general",
            "tags": [],
            "ai_generated": False,
            "ai_metadata": {
                "original_input": task_input,
                "parsing_failed": True,
                "error": error_info,
                "fallback_used": True
            }
        }
        
        result = self.add_task(task_data, user_id)
        result["ai_parsing"] = task_data["ai_metadata"]
        
        return result

    def _fallback_categorization(self, task_title: str, task_description: str = "", 
                                error_info: str = "") -> Dict[str, Any]:
        """Provide basic categorization when AI analysis fails"""
        # Simple keyword-based categorization
        text = (task_title + " " + task_description).lower()
        
        category = "general"
        tags = []
        
        # Basic categorization rules
        if any(word in text for word in ["meeting", "call", "conference", "appointment"]):
            category = "meeting"
            tags.append("meeting")
        elif any(word in text for word in ["buy", "shop", "purchase", "store"]):
            category = "shopping"
            tags.append("shopping")
        elif any(word in text for word in ["learn", "study", "course", "tutorial", "education"]):
            category = "learning"
            tags.append("learning")
        elif any(word in text for word in ["work", "project", "job", "office", "business"]):
            category = "work"
            tags.append("work")
        elif any(word in text for word in ["health", "doctor", "exercise", "fitness"]):
            category = "health"
            tags.append("health")
        elif any(word in text for word in ["urgent", "asap", "immediately", "emergency"]):
            category = "urgent"
            tags.append("urgent")
        
        # Extract basic tags
        if "important" in text:
            tags.append("important")
        if "quick" in text or "fast" in text:
            tags.append("quick")
        if "research" in text:
            tags.append("research")
        
        return {
            "success": False,
            "analysis": {
                "recommended_category": category,
                "category_confidence": 0.6,
                "recommended_tags": tags,
                "task_type": "general",
                "fallback_used": True,
                "error": error_info
            },
            "provider": "fallback"
        }

    def _get_urgency_reason(self, task):
        """Generate urgency reasoning for a task"""
        due_date = task.get('due_date')
        priority = task.get('priority', 'medium')
        
        if not due_date:
            return "No deadline set"
        
        try:
            if isinstance(due_date, str):
                due_datetime = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            else:
                due_datetime = due_date
            
            now = datetime.now(due_datetime.tzinfo) if due_datetime.tzinfo else datetime.now()
            time_diff = due_datetime - now
            
            if time_diff.total_seconds() < 0:
                return "Already past due"
            elif time_diff.days == 0:
                return "Due today"
            elif time_diff.days == 1:
                return "Due tomorrow"
            elif time_diff.days <= 3:
                return f"Due in {time_diff.days} days"
            elif time_diff.days <= 7:
                return "Due this week"
            else:
                return f"Due in {time_diff.days} days"
        except:
            return "Invalid due date"
    
    def _get_importance_reason(self, task):
        """Generate importance reasoning for a task"""
        priority = task.get('priority', 'medium')
        category = task.get('category', 'general')
        title = task.get('title', '').lower()
        
        if priority == 'high':
            return "High priority task requiring immediate attention"
        elif priority == 'low':
            return "Low priority task that can be deferred"
        else:
            # Analyze title for importance keywords
            important_keywords = ['urgent', 'important', 'critical', 'deadline', 'meeting', 'interview', 'exam']
            if any(keyword in title for keyword in important_keywords):
                return "Contains important keywords suggesting high impact"
            elif category in ['work', 'health', 'education']:
                return f"Important {category}-related task"
            else:
                return "Standard importance level"


