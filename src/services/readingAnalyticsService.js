import { get, post, put } from '~/lib/httpRequest';

const url = '/mangas/reading-analytics';

export const createReadingSession = (data) => post(`${url}/session`, data);

export const updateReadingGoal = (data) => put(`${url}/goal`, data);

export const getReadingGoal = ({ userId }) => get(`${url}/goal`, { params: { userId } });

export const getReadingGoalProgress = ({ userId }) => get(`${url}/goal/progress`, { params: { userId } });

export const getReadingStreak = ({ userId }) => get(`${url}/streak`, { params: { userId } });

export const getReadingCalendar = ({ userId, days = 30 }) => get(`${url}/calendar`, { params: { userId, days } });
