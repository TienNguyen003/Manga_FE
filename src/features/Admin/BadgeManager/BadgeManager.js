import { AddRounded, EditRounded, DeleteOutlineRounded, WorkspacePremiumRounded } from '@mui/icons-material';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, IconButton, Tooltip } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './Badges.module.scss';

const cx = classNames.bind(styles);

export default function BadgeManager() {
  const badges = [
    { id: '001', name: 'Vip Member', image: 'https://cdn-icons-png.flaticon.com/512/6198/6198527.png', count: 1254, date: '12/04/2026' },
    { id: '002', name: 'Top Contributor', image: 'https://cdn-icons-png.flaticon.com/512/6198/6198527.png', count: 85, date: '10/04/2026' },
    { id: '003', name: 'Legendary', image: 'https://cdn-icons-png.flaticon.com/512/6198/6198527.png', count: 12, date: '01/04/2026' },
  ];

  return (
    <div className={cx('pageContainer')}>
      {/* Header đồng nhất */}
      <header className={cx('pageHeader')}>
        <Box>
          <Typography className={cx('title')}>Kho Huy Hiệu</Typography>
          <Typography className={cx('subtitle')}>Cửa hàng và hệ thống danh hiệu dành cho thành viên.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} className={cx('addBtn')}>
          Tạo huy hiệu mới
        </Button>
      </header>

      {/* Table Section */}
      <TableContainer component={Paper} className={cx('tableWrapper')} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>HUY HIỆU</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>MÃ ID</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>SỞ HỮU</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>NGÀY TẠO</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">THAO TÁC</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {badges.map((badge) => (
              <TableRow key={badge.id} className={cx('tableRow')}>
                <TableCell>
                  <Box className={cx('badgeInfoCell')}>
                    <div className={cx('imageBox')}>
                      <img src={badge.image} alt={badge.name} />
                    </div>
                    <Typography className={cx('badgeName')}>{badge.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell className={cx('idText')}>#{badge.id}</TableCell>
                <TableCell>
                  <Typography className={cx('countText')}>
                    <b>{badge.count.toLocaleString()}</b> người
                  </Typography>
                </TableCell>
                <TableCell className={cx('dateText')}>{badge.date}</TableCell>
                <TableCell align="right">
                  <div className={cx('actionGroup')}>
                    <Tooltip title="Sửa">
                      <IconButton size="small" className={cx('editIcon')}><EditRounded /></IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton size="small" className={cx('deleteIcon')}><DeleteOutlineRounded /></IconButton>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}