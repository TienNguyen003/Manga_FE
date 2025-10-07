import paths from './paths';

// Features (formerly Pages)
import Home from '~/features/Home/Home';
import CategorySection from '~/features/CategorySection/Category';
import MangaDetail from '~/features/MangaDetail/MangaDetail';
import ChapterReader from '~/features/MangaDetail/ChapterReader';

// Public routes
const publicRoutes = [
    { path: paths.home, component: Home },
    { path: paths.category, component: CategorySection },
    { path: paths.mangaDetail, component: MangaDetail },
    { path: paths.chapterDetail, component: ChapterReader },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };