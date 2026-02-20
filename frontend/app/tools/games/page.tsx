import AuthWrapper from '@/app/components/AuthWrapper';
import GameDashboard from '@/app/components/games/GameDashboard';

export default function GamesPage() {
    return (
        <AuthWrapper>
            <GameDashboard />
        </AuthWrapper>
    );
}
