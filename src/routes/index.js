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

// Public routes
const publicRoutes = [
  { path: paths.home, component: Home },
  { path: paths.category, component: CategorySection },
  { path: paths.mangaDetail, component: MangaDetail },
  { path: paths.chapterDetail, component: ChapterReader },
  { path: paths.discover, component: Discover },
  { path: paths.rankings, component: Rankings },
  { path: paths.community, component: Community },
  { path: paths.communityTopic, component: CommunityTopic },
  { path: paths.postDetail, component: PostDetail },
  { path: paths.authorHub, component: AuthorHub },
  { path: paths.releaseCalendar, component: ReleaseCalendar },
  { path: paths.advancedSearch, component: AdvancedSearch },
  { path: paths.library, component: Library },
  { path: paths.notifications, component: Notifications },
  { path: paths.dashboard, component: UserDashboard },
  { path: paths.upload, component: Upload },
  { path: paths.report, component: Report },
  { path: paths.profile, component: Profile },
  { path: paths.recommendations, component: Recommendations },
  { path: paths.changePassword, component: ChangePassword },
  { path: paths.myComics, component: MyComics },
  { path: paths.login, component: Login },
  { path: paths.register, component: Register },
  { path: paths.forgotPassword, component: ForgotPassword },
];

const privateRoutesNoHeader = [];

const privateRoutes = [];

export { publicRoutes, privateRoutes, privateRoutesNoHeader };
