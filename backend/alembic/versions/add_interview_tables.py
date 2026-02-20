"""Add interview training tables

Revision ID: add_interview_tables
Revises: 8527256f2c24
Create Date: 2025-08-04 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_interview_tables'
down_revision = '8527256f2c24'  # Set to depend on the latest migration
branch_labels = None
depends_on = None


def upgrade():
    # Check if enum types already exist before creating them
    from sqlalchemy import text
    
    # Check and create difficulty level enum if it doesn't exist
    difficulty_exists = op.get_bind().execute(text(
        "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficultylevel')"
    )).scalar()
    
    if not difficulty_exists:
        op.execute("CREATE TYPE difficultylevel AS ENUM ('junior', 'mid', 'senior', 'expert')")
    
    # Check and create answer type enum if it doesn't exist
    answer_type_exists = op.get_bind().execute(text(
        "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'answertype')"
    )).scalar()
    
    if not answer_type_exists:
        op.execute("CREATE TYPE answertype AS ENUM ('text', 'video', 'audio')")

    # Check if interview_sessions table exists before creating it
    sessions_exists = op.get_bind().execute(text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interview_sessions')"
    )).scalar()
    
    if not sessions_exists:
        # Create interview_sessions table
        op.create_table('interview_sessions',
            sa.Column('id', sa.String(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=True),
            sa.Column('topic', sa.String(), nullable=False),
            sa.Column('difficulty_level', sa.Text(), nullable=False),  # Use Text temporarily
            sa.Column('session_type', sa.String(), nullable=True),
            sa.Column('total_questions', sa.Integer(), nullable=True),
            sa.Column('questions_answered', sa.Integer(), nullable=True),
            sa.Column('average_score', sa.Float(), nullable=True),
            sa.Column('overall_feedback', sa.Text(), nullable=True),
            sa.Column('recommendations', sa.JSON(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_interview_sessions_id'), 'interview_sessions', ['id'], unique=False)
        
        # Now alter the column to use the enum type
        op.execute("ALTER TABLE interview_sessions ALTER COLUMN difficulty_level TYPE difficultylevel USING difficulty_level::difficultylevel")
    else:
        # Table exists, check if it needs to be updated to use enum types
        try:
            # Try to alter existing table column to use enum if it's not already
            column_type = op.get_bind().execute(text(
                "SELECT data_type FROM information_schema.columns WHERE table_name = 'interview_sessions' AND column_name = 'difficulty_level'"
            )).scalar()
            
            if column_type and column_type.lower() != 'user-defined':
                op.execute("ALTER TABLE interview_sessions ALTER COLUMN difficulty_level TYPE difficultylevel USING difficulty_level::difficultylevel")
        except Exception:
            # If alteration fails, the column might already be the correct type
            pass

    # Check if interview_questions table exists before creating it
    questions_exists = op.get_bind().execute(text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interview_questions')"
    )).scalar()
    
    if not questions_exists:
        # Create interview_questions table
        op.create_table('interview_questions',
            sa.Column('id', sa.String(), nullable=False),
            sa.Column('session_id', sa.String(), nullable=False),
            sa.Column('question_text', sa.Text(), nullable=False),
            sa.Column('question_order', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.ForeignKeyConstraint(['session_id'], ['interview_sessions.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_interview_questions_id'), 'interview_questions', ['id'], unique=False)

    # Check if interview_answers table exists before creating it
    answers_exists = op.get_bind().execute(text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interview_answers')"
    )).scalar()
    
    if not answers_exists:
        # Create interview_answers table
        op.create_table('interview_answers',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('session_id', sa.String(), nullable=False),
            sa.Column('question_id', sa.String(), nullable=False),
            sa.Column('user_answer', sa.Text(), nullable=False),
            sa.Column('answer_type', sa.Text(), nullable=True),  # Use Text temporarily
            sa.Column('score', sa.Float(), nullable=True),
            sa.Column('feedback', sa.Text(), nullable=True),
            sa.Column('strengths', sa.JSON(), nullable=True),
            sa.Column('areas_for_improvement', sa.JSON(), nullable=True),
            sa.Column('criteria_scores', sa.JSON(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.Column('evaluated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['question_id'], ['interview_questions.id'], ),
            sa.ForeignKeyConstraint(['session_id'], ['interview_sessions.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_interview_answers_id'), 'interview_answers', ['id'], unique=False)
        
        # Now alter the column to use the enum type
        op.execute("ALTER TABLE interview_answers ALTER COLUMN answer_type TYPE answertype USING answer_type::answertype")
    else:
        # Table exists, check if it needs to be updated to use enum types
        try:
            # Try to alter existing table column to use enum if it's not already
            column_type = op.get_bind().execute(text(
                "SELECT data_type FROM information_schema.columns WHERE table_name = 'interview_answers' AND column_name = 'answer_type'"
            )).scalar()
            
            if column_type and column_type.lower() != 'user-defined':
                op.execute("ALTER TABLE interview_answers ALTER COLUMN answer_type TYPE answertype USING answer_type::answertype")
        except Exception:
            # If alteration fails, the column might already be the correct type
            pass

    # Check if user_performance table exists before creating it
    performance_exists = op.get_bind().execute(text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_performance')"
    )).scalar()
    
    if not performance_exists:
        # Create user_performance table
        op.create_table('user_performance',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('topic', sa.String(), nullable=False),
            sa.Column('interviews_taken', sa.Integer(), nullable=True),
            sa.Column('total_score', sa.Float(), nullable=True),
            sa.Column('average_score', sa.Float(), nullable=True),
            sa.Column('best_score', sa.Float(), nullable=True),
            sa.Column('latest_score', sa.Float(), nullable=True),
            sa.Column('strengths', sa.JSON(), nullable=True),
            sa.Column('weaknesses', sa.JSON(), nullable=True),
            sa.Column('improvement_suggestions', sa.JSON(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_user_performance_id'), 'user_performance', ['id'], unique=False)


def downgrade():
    # Drop tables only if they exist
    from sqlalchemy import text
    
    # Check and drop user_performance table
    performance_exists = op.get_bind().execute(text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_performance')"
    )).scalar()
    if performance_exists:
        op.drop_index(op.f('ix_user_performance_id'), table_name='user_performance')
        op.drop_table('user_performance')
    
    # Check and drop interview_answers table
    answers_exists = op.get_bind().execute(text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interview_answers')"
    )).scalar()
    if answers_exists:
        op.drop_index(op.f('ix_interview_answers_id'), table_name='interview_answers')
        op.drop_table('interview_answers')
    
    # Check and drop interview_questions table
    questions_exists = op.get_bind().execute(text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interview_questions')"
    )).scalar()
    if questions_exists:
        op.drop_index(op.f('ix_interview_questions_id'), table_name='interview_questions')
        op.drop_table('interview_questions')
    
    # Check and drop interview_sessions table
    sessions_exists = op.get_bind().execute(text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interview_sessions')"
    )).scalar()
    if sessions_exists:
        op.drop_index(op.f('ix_interview_sessions_id'), table_name='interview_sessions')
        op.drop_table('interview_sessions')
    
    # Only drop enum types if they're not used by other tables
    # Check if answertype is used elsewhere
    answer_type_usage = op.get_bind().execute(text("""
        SELECT COUNT(*) FROM information_schema.columns 
        WHERE udt_name = 'answertype' AND table_name NOT IN ('interview_answers')
    """)).scalar()
    
    if answer_type_usage == 0:
        op.execute('DROP TYPE IF EXISTS answertype')
    
    # Check if difficultylevel is used elsewhere  
    difficulty_usage = op.get_bind().execute(text("""
        SELECT COUNT(*) FROM information_schema.columns 
        WHERE udt_name = 'difficultylevel' AND table_name NOT IN ('interview_sessions')
    """)).scalar()
    
    if difficulty_usage == 0:
        op.execute('DROP TYPE IF EXISTS difficultylevel')
