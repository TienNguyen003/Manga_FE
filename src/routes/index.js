import paths from './paths';

// Features (formerly Pages)
import Home from '~/features/Home/Home';
import CategorySection from '~/features/CategorySection/Category';
import MangaDetail from '~/features/MangaDetail/MangaDetail';
import ChapterReader from '~/features/MangaDetail/ChapterReader';
import Library from '~/features/Library/Library';
import Notifications from '~/features/Notifications/Notifications';
import UserDashboard from '~/features/Dashboard/UserDashboard';
import Discover from '~/features/Discover/Discover';
import Rankings from '~/features/Rankings/Rankings';
import Community from '~/features/Community/Community';
import CommunityTopic from '~/features/Community/CommunityTopic';
import PostDetail from '~/features/Community/PostDetail';
import AuthorHub from '~/features/AuthorHub/AuthorHub';
import TeamProfile from '~/features/AuthorHub/TeamProfile';
import ReleaseCalendar from '~/features/ReleaseCalendar/ReleaseCalendar';
import AdvancedSearch from '~/features/AdvancedSearch/AdvancedSearch';
import Upload from '~/features/Upload/Upload';
import Report from '~/features/Report/Report';
import Profile from '~/features/Profile/Profile';
import Recommendations from '~/features/Recommendations/Recommendations';
import ChangePassword from '~/features/ChangePassword/ChangePassword';
import MyComics from '~/features/MyComics/MyComics';
import Login from '~/features/Login/Login';
import Register from '~/features/Register/Register';
import ForgotPassword from '~/features/ForgotPassword/ForgotPassword';
import PublicProfile from '~/features/Profile/PublicProfile';
import Dashboard from '~/features/Admin/Dashboard/Dashboard';
import UserManagement from '~/features/Admin/UserManagement/UserManagement';
import BadgeManager from '~/features/Admin/BadgeManager/BadgeManager';
import AdminStats from '~/features/Admin/Stats/Stats';
import AdminSettings from '~/features/Admin/Settings/Settings';
import AdsManagement from '~/features/Admin/AdsManagement/AdsManagement';
import MangaManagement from '~/features/Admin/MangaManagement/MangaManagement';
import TeamManagement from '~/features/Admin/TeamManagement/Teams';
import TopicManagement from '~/features/Admin/TopicsManagement/Topics';
import PostManagement from '~/features/Admin/TopicsManagement/Posts';
import TeamMembers from '~/features/Admin/TeamManagement/TeamMembers';
import MangaReviews from '~/features/Admin/MangaManagement/MangaReviews';
import CommentManagement from '~/features/Admin/MangaManagement/CommentManagement';
import RecommendationControlPanel from '~/features/Admin/Recommendation/RecommendationControlPanel';
import CommunityModerationPanel from '~/features/Admin/TopicsManagement/CommunityModerationPanel';
import UserSecurityPanel from '~/features/Admin/UserManagement/UserSecurityPanel';
import RbacPanel from '~/features/Admin/RbacPanel/RbacPanel';
import CollectionAuditPanel from '~/features/Admin/CollecionAuditPanel/CollectionAuditPanel';
import OpsMonitoringPanel from '~/features/Admin/OpsMonitoringPanel/OpsMonitoringPanel';
import SecurityAuditPanel from '~/features/Admin/OpsMonitoringPanel/SecurityAuditPanel';
import Maintenance from '~/components/Errors/Maintenance';
import NoAccess from '~/components/Errors/NoAccess';

// Public routes
const publicRoutes = [
  { path: paths.home, component: Home, layout: 'default' },
  { path: paths.category, component: CategorySection, layout: 'default' },
  { path: paths.mangaDetail, component: MangaDetail, layout: 'default' },
  { path: paths.chapterDetail, component: ChapterReader, layout: 'default' },
  { path: paths.discover, component: Discover, layout: 'default' },
  { path: paths.rankings, component: Rankings, layout: 'default' },
  { path: paths.community, component: Community, layout: 'default' },
  { path: paths.communityTopic, component: CommunityTopic, layout: 'default' },
  { path: paths.postDetail, component: PostDetail, layout: 'default' },
  { path: paths.authorHub, component: AuthorHub, layout: 'default' },
  { path: paths.teamProfile, component: TeamProfile, layout: 'default' },
  { path: paths.releaseCalendar, component: ReleaseCalendar, layout: 'default' },
  { path: paths.advancedSearch, component: AdvancedSearch, layout: 'default' },
  { path: paths.notifications, component: Notifications, layout: 'default' },
  { path: paths.publicProfile, component: PublicProfile, layout: 'default' },
  { path: paths.login, component: Login, layout: 'default' },
  { path: paths.register, component: Register, layout: 'default' },
  { path: paths.forgotPassword, component: ForgotPassword, layout: 'default' },
];

const publicRoutesNoHeader = [
  { path: paths.maintenance, component: Maintenance, layout: 'no_header' },
  { path: paths.unauthorized, component: NoAccess, layout: 'no_header' },
];

const privateRoutesNoHeader = [];

const privateRoutes = [
  { path: paths.profile, component: Profile, layout: 'private' },
  { path: paths.library, component: Library, layout: 'private' },
  { path: paths.dashboard, component: UserDashboard, layout: 'private' },
  { path: paths.upload, component: Upload, layout: 'private' },
  { path: paths.report, component: Report, layout: 'private' },
  { path: paths.changePassword, component: ChangePassword, layout: 'private' },
  { path: paths.myComics, component: MyComics, layout: 'private' },
  { path: paths.recommendations, component: Recommendations, layout: 'private' },
];

const adminRoutes = [
  { path: paths.adminDashboard, component: Dashboard, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.userManagement, component: UserManagement, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.badgeManagement, component: BadgeManager, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.systemStats, component: AdminStats, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.adminSettings, component: AdminSettings, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.adManagement, component: AdsManagement, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.mangaManagement, component: MangaManagement, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.mangaReview, component: MangaReviews, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.mangaComment, component: CommentManagement, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.teamManagement, component: TeamManagement, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.teamMember, component: TeamMembers, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.topicManagement, component: TopicManagement, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.postManagement, component: PostManagement, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.recommendationControl, component: RecommendationControlPanel, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.communityModeration, component: CommunityModerationPanel, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.userSecurity, component: UserSecurityPanel, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.rbacManagement, component: RbacPanel, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.collectionAudit, component: CollectionAuditPanel, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.opsMonitoring, component: OpsMonitoringPanel, layout: 'admin', roles: ['ADMIN'] },
  { path: paths.securityAudit, component: SecurityAuditPanel, layout: 'admin', roles: ['ADMIN'] },
];

export { publicRoutes, publicRoutesNoHeader, privateRoutes, privateRoutesNoHeader, adminRoutes };
