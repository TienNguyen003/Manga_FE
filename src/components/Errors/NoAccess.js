import { AdminPanelSettingsRounded, ArrowBackRounded, LockRounded } from '@mui/icons-material';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NoAccess.module.scss';

const cx = classNames.bind(styles);

export default function NoAccess() {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Hiệu ứng xoay 3D nhẹ theo con chuột
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      const { innerWidth: width, innerHeight: height } = window;

      const dx = x - width / 2;
      const dy = y - height / 2;

      const rotateX = (dy / height) * -15; // Xoay max 15 độ
      const rotateY = (dx / width) * 15;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Box className={cx('pageWrapper')}>
      <Container maxWidth="md" className={cx('container')}>
        <div ref={cardRef} className={cx('securityCard')}>
          <div className={cx('visualArea')}>
            <div className={cx('scannerCircle')}>
              <LockRounded sx={{ fontSize: 90 }} className={cx('lockIcon')} />
              <div className={cx('scannerBeam')} />
            </div>
            <div className={cx('dataGrid')} />
          </div>

          <Box className={cx('textArea')}>
            <Typography variant="h1" className={cx('errorCode')}>
              403
            </Typography>
            <Typography variant="h3" className={cx('errorTitle')}>
              TRUY CẬP BỊ TỪ CHỐI
            </Typography>
            <Typography className={cx('errorDesc')}>
              Hệ thống WAF đã chặn yêu cầu của bạn. Tài khoản của bạn không nằm trong danh sách được phép truy cập vào phân khu này.
            </Typography>

            <Stack direction="row" spacing={2.5} justifyContent="center" mt={5}>
              <Button variant="contained" startIcon={<ArrowBackRounded />} onClick={() => navigate(-1)} className={cx('btnAdmin')}>
                Quay lại
              </Button>
            </Stack>
          </Box>
        </div>
      </Container>
      <div className={cx('backgroundNoise')} />
    </Box>
  );
}
