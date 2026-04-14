import { AutoAwesomeRounded, HandymanRounded, TimerRounded } from '@mui/icons-material';
import { Box, Chip, Container, LinearProgress, Stack, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './Maintenance.module.scss';

const cx = classNames.bind(styles);

export default function Maintenance() {
  return (
    <Box className={cx('pageWrapper')}>
      <Container maxWidth="lg" className={cx('container')}>
        <div className={cx('contentSplit')}>
          {/* Bên trái: Text và Progress */}
          <Box className={cx('textSection')}>
            <Chip icon={<AutoAwesomeRounded />} label="Hệ thống đang được nâng cấp" className={cx('statusChip')} />
            <Typography variant="h2" className={cx('mainTitle')}>
              Đóng cửa tu luyện
            </Typography>
            <Typography className={cx('mainDesc')}>
              "Lạc Thiên Nhóm" đang tinh chỉnh lại các "mạch dẫn" tâm pháp để mang đến trải nghiệm đọc truyện mượt mà hơn. Đừng lo, mọi dữ liệu của bạn vẫn an toàn.
            </Typography>

            <Box className={cx('progressBlock')}>
              <LinearProgress variant="determinate" value={78} className={cx('bar')} />
              <div className={cx('barLabel')}>
                <span>Tiến độ nâng cấp hệ thống</span>
                <span>78%</span>
              </div>
            </Box>

            <Stack direction="row" spacing={3} mt={6} className={cx('infoStack')}>
              <div className={cx('infoCard')}>
                <TimerRounded className={cx('infoIcon')} />
                <div>
                  <Typography className={cx('infoLabel')}>Dự kiến mở lại</Typography>
                  <Typography className={cx('infoValue')}>15 phút nữa</Typography>
                </div>
              </div>
              <div className={cx('infoCard')}>
                <HandymanRounded className={cx('infoIcon')} />
                <div>
                  <Typography className={cx('infoLabel')}>Mọi thắc mắc</Typography>
                  <Typography className={cx('infoValue')}>Liên hệ bộ phận hỗ trợ</Typography>
                </div>
              </div>
            </Stack>
          </Box>

          {/* Bên phải: 3D Visualization (Mock) */}
          <Box className={cx('visualSection')}>
            <div className={cx('scene')}>
              <div className={cx('cube', 'cube1')}>
                <div className={cx('face', 'front')} />
                <div className={cx('face', 'back')} />
                <div className={cx('face', 'right')} />
                <div className={cx('face', 'left')} />
                <div className={cx('face', 'top')} />
                <div className={cx('face', 'bottom')} />
              </div>
              <div className={cx('cube', 'cube2')}>
                <div className={cx('face', 'front')} />
                <div className={cx('face', 'back')} />
                <div className={cx('face', 'right')} />
                <div className={cx('face', 'left')} />
                <div className={cx('face', 'top')} />
                <div className={cx('face', 'bottom')} />
              </div>
              <HandymanRounded className={cx('toolIcon')} />
            </div>
          </Box>
        </div>
      </Container>
      <div className={cx('abstractShapes')} />
    </Box>
  );
}
