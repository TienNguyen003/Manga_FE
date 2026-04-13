import { ArrowBackRounded, MailRounded, MoreVertRounded, PersonAddRounded, PhoneRounded, VerifiedUserRounded } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Grid, IconButton, Paper, Typography, Tooltip } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './TeamMembers.module.scss';

const cx = classNames.bind(styles);

export default function TeamMembers() {
  const members = [
    { id: 1, name: 'Duy Nguyễn', role: 'Leader', joinDate: 'Jan 2025', avatar: '', status: 'Online' },
    { id: 2, name: 'Manga Lover', role: 'Translator', joinDate: 'Mar 2025', avatar: '', status: 'Offline' },
    { id: 3, name: 'Clean Master', role: 'Editor', joinDate: 'Feb 2025', avatar: '', status: 'Online' },
  ];

  return (
    <div className={cx('memberWrapper')}>
      {/* --- HEADER --- */}
      <Box className={cx('header')}>
        <div className={cx('titleBox')}>
          <IconButton className={cx('backBtn')}>
            <ArrowBackRounded />
          </IconButton>
          <Box ml={2}>
            <Typography className={cx('mainTitle')}>Thành viên: Lạc Thiên Nhóm</Typography>
            <Typography className={cx('subTitle')}>Quản lý nhân sự và phân quyền nhóm dịch của bạn</Typography>
          </Box>
        </div>
        <Button variant="contained" startIcon={<PersonAddRounded />} className={cx('addBtn')}>
          Mời thành viên
        </Button>
      </Box>

      {/* --- GRID LIST --- */}
      <Grid container spacing={3}>
        {members.map((member) => (
          <Grid item size={3} key={member.id}>
            <Paper className={cx('memberCard')} elevation={0}>
              <div className={cx('cardHeader')}>
                <div className={cx('statusIndicator', member.status.toLowerCase())}>
                  <span className={cx('dot')} />
                  {member.status}
                </div>
                <IconButton size="small" className={cx('moreBtn')}>
                  <MoreVertRounded />
                </IconButton>
              </div>

              <div className={cx('cardBody')}>
                <div className={cx('avatarWrapper')}>
                  <Avatar className={cx('avatar')}>{member.name[0]}</Avatar>
                  {member.role === 'Leader' && (
                    <div className={cx('badge')}>
                      <VerifiedUserRounded />
                    </div>
                  )}
                </div>

                <Typography className={cx('memberName')}>{member.name}</Typography>

                <Chip label={member.role} size="small" className={cx('roleChip')} />

                <Typography className={cx('joinText')}>
                  Thành viên từ: <b>{member.joinDate}</b>
                </Typography>
              </div>

              <div className={cx('cardFooter')}>
                <Tooltip title="Gửi Email">
                  <IconButton className={cx('contactBtn')}>
                    <MailRounded />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Gọi điện">
                  <IconButton className={cx('contactBtn')}>
                    <PhoneRounded />
                  </IconButton>
                </Tooltip>
                <Button className={cx('profileBtn')}>Hồ sơ</Button>
              </div>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
