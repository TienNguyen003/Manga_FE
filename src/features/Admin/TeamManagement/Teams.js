import { AddRounded, DeleteOutlineRounded, GroupRounded, SettingsRounded, StarsRounded, LibraryBooksRounded } from '@mui/icons-material';
import { Avatar, Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, Tooltip } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './Teams.module.scss';
import paths from '~/routes/paths';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

export default function TeamManagement() {
  const teams = [
    { id: 1, name: 'Lạc Thiên Nhóm', leader: 'Duy Nguyễn', members: 12, projects: 5, avatar: 'L', color: '#ea982b' },
    { id: 2, name: 'Dark Night Scan', leader: 'Trần Văn A', members: 8, projects: 3, avatar: 'D', color: '#3b82f6' },
  ];

  return (
    <div className={cx('pageContainer')}>
      {/* --- HEADER --- */}
      <header className={cx('header')}>
        <Box>
          <Typography className={cx('title')}>Nhóm Dịch Hệ Thống</Typography>
          <Typography className={cx('subtitle')}>Quản lý các tổ chức dịch thuật và cộng tác viên.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} className={cx('addBtn')}>
          Thành lập nhóm
        </Button>
      </header>

      {/* --- TABLE AREA --- */}
      <TableContainer component={Paper} className={cx('tableWrapper')} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>NHÓM DỊCH</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>TRƯỞNG NHÓM</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>QUY MÔ</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>DỰ ÁN ĐANG THỰC HIỆN</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">
                QUẢN TRỊ
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id} className={cx('tableRow')}>
                <TableCell>
                  <Box className={cx('teamInfo')}>
                    <Avatar className={cx('teamAvatar')} sx={{ bgcolor: team.color }}>
                      {team.avatar}
                    </Avatar>
                    <Typography className={cx('teamName')}>{team.name}</Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip icon={<StarsRounded sx={{ color: `${team.color} !important` }} />} label={team.leader} className={cx('leaderChip')} />
                </TableCell>

                <TableCell>
                  <Box className={cx('memberBox')}>
                    <GroupRounded className={cx('icon')} />
                    <Typography>
                      <b>{team.members}</b> thành viên
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box className={cx('projectBox')}>
                    <LibraryBooksRounded className={cx('icon')} />
                    <Typography>
                      <b>{team.projects}</b> tác phẩm
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="right">
                  <div className={cx('actionGroup')}>
                    <Link to={paths.teamMember.replace(':id', team.id)}>
                      <Button variant="contained" disableElevation size="small" className={cx('manageBtn')} startIcon={<GroupRounded />}>
                        Thành viên
                      </Button>
                    </Link>
                    <Tooltip title="Cài đặt nhóm">
                      <IconButton size="small" className={cx('iconBtn')}>
                        <SettingsRounded />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Giải tán nhóm">
                      <IconButton size="small" className={cx('iconBtn', 'delete')}>
                        <DeleteOutlineRounded />
                      </IconButton>
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
