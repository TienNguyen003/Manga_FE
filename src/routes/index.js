import paths from './paths';

// Features (formerly Pages)
import Home from '~/features/Home/Home';
import CategorySection from '~/features/CategorySection/Category';
import MangaDetail from '~/features/MangaDetail/MangaDetail';
import ChapterReader from '~/features/MangaDetail/ChapterReader';
import Library from '~/features/Library/Library';
import Notifications from '~/features/Notifications/Notifications';
import UserDashboard from '~/features/Dashboard/UserDashboard';

// Public routes
const publicRoutes = [
  { path: paths.home, component: Home },
  { path: paths.category, component: CategorySection },
  { path: paths.mangaDetail, component: MangaDetail },
  { path: paths.chapterDetail, component: ChapterReader },
  { path: paths.library, component: Library },
  { path: paths.notifications, component: Notifications },
  { path: paths.dashboard, component: UserDashboard },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
