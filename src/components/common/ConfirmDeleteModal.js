import { WarningRounded } from '@mui/icons-material';
import { Box, Button, Dialog, DialogContent, DialogActions, Typography, Stack } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './ConfirmDeleteModal.module.scss';

const cx = classNames.bind(styles);

export default function ConfirmDeleteModal({ open, onClose, onConfirm, title, content }) {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ className: cx('deleteModal') }} maxWidth="xs" fullWidth>
      <DialogContent className={cx('modalBody')}>
        <Stack alignItems="center" spacing={2}>
          {/* Icon cảnh báo với hiệu ứng rung nhẹ hoặc đổ bóng */}
          <Box className={cx('iconWrapper')}>
            <WarningRounded className={cx('warningIcon')} />
          </Box>

          <Typography variant="h5" className={cx('title')}>
            {title || 'Xác nhận xóa?'}
          </Typography>

          <Typography
            className={cx('description')}
            dangerouslySetInnerHTML={{ __html: content || 'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa mục này khỏi hệ thống?' }}
          />
        </Stack>
      </DialogContent>

      <DialogActions className={cx('modalFooter')}>
        <Button onClick={onClose} className={cx('cancelBtn')}>
          Hủy bỏ
        </Button>
        <Button onClick={onConfirm} variant="contained" className={cx('confirmBtn')}>
          Đồng ý xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
}
