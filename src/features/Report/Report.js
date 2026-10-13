import { CampaignRounded } from '@mui/icons-material';
import { Alert, Autocomplete, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useState } from 'react';
import { errorMessage } from '~/lib/httpRequest';
import { reportService } from '~/services/reportService';
import styles from './Report.module.scss';

const cx = classNames.bind(styles);

/** Labels shown in the picker; the API expects the enum values below. */
const REPORT_TYPE_OPTIONS = [
  { value: 'OFFENSIVE', label: 'Báo lỗi truyện' },
  { value: 'SPAM', label: 'Báo cáo vi phạm' },
  { value: 'COPYRIGHT', label: 'Báo lỗi hình ảnh / bản quyền' },
  { value: 'OTHER', label: 'Vấn đề tài khoản / Khác' },
];

export default function Report() {
  const [type, setType] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    if (!type || !content) {
      setStatus({ type: 'error', msg: 'Vui lòng chọn loại báo cáo và nhập nội dung.' });
      return;
    }

    setLoading(true);
    try {
      // ⚠️ `reporterId` is NEVER sent — the backend takes the reporter from
      // the JWT (see reportService). A 2xx never rejects, so reaching this
      // line means the report was accepted.
      await reportService.sendReport({
        type: type.value,
        targetType: 'MANGA',
        content,
      });
      setStatus({ type: 'success', msg: 'Cảm ơn phản hồi của bạn, chúng tôi sẽ xử lý sớm!' });
      setContent('');
      setType(null);
    } catch (err) {
      setStatus({ type: 'error', msg: errorMessage(err, 'Gửi báo cáo thất bại, thử lại sau nhé.') });
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className={cx('reportPage')}>
      <div className={cx('content')}>
        <Typography variant="h2" className={cx('pageTitle')}>
          Báo Cáo Sự Cố
        </Typography>

        <Typography className={cx('subTitle')}>Chúng tôi luôn lắng nghe để cải thiện cộng đồng tốt hơn mỗi ngày.</Typography>

        <form className={cx('form')} onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Autocomplete
              options={REPORT_TYPE_OPTIONS}
              value={type}
              getOptionLabel={(option) => option?.label ?? ''}
              onChange={(e, newValue) => setType(newValue)}
              renderInput={(params) => <TextField {...params} label="Vấn đề bạn gặp phải" variant="outlined" placeholder="Chọn loại báo cáo..." />}
            />

            <TextField
              fullWidth
              label="Nội dung chi tiết"
              variant="outlined"
              multiline
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mô tả cụ thể sự cố để chúng tôi hỗ trợ bạn tốt nhất..."
            />

            {status.msg && (
              <Alert severity={status.type} sx={{ fontSize: '1.4rem' }}>
                {status.msg}
              </Alert>
            )}

            <Button className={cx('submitBtn')} type="submit" disabled={loading} startIcon={!loading && <CampaignRounded />}>
              {loading ? <CircularProgress size={28} color="inherit" /> : 'GỬI PHẢN HỒI'}
            </Button>
          </Stack>
        </form>
      </div>
    </main>
  );
}
