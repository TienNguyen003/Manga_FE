import { ArrowBackRounded, MailRounded, MoreVertRounded, PersonAddRounded, PhoneRounded, VerifiedUserRounded } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Grid, IconButton, Paper, Typography, Tooltip } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminService } from '~/services/adminService';
import styles from './TeamMembers.module.scss';
import { toast } from 'react-toastify';
import MangaCard from '~/components/common/MangaCard';

const cx = classNames.bind(styles);

export default function TeamMembers() {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [teamInfo, setTeamInfo] = useState();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (id) loadMembers();
  }, [id]);

  const loadMembers = async () => {
    try {
      const response = await adminService.getTeamMembers(id);
      const data = response?.result || [];
      setMembers(data.members || []);
      setTeamInfo(data || {});
      setProjects(data.projects || []);
    } catch {
      toast.error('Không thể tải danh sách thành viên nhóm dịch.');
    }
  };

  return (
    <div className={cx('memberWrapper')}>
      {/* --- HEADER --- */}
      <Box className={cx('header')}>
        <div className={cx('titleBox')}>
          <div>
            <IconButton className={cx('backBtn')}>
              <ArrowBackRounded />
            </IconButton>
          </div>
          <Box ml={2}>
            <Typography className={cx('mainTitle')}>Thành viên: {teamInfo?.name || 'Team'}</Typography>
            <Typography className={cx('subTitle')}>Quản lý nhân sự và phân quyền nhóm dịch của bạn</Typography>
          </Box>
        </div>
        <Button variant="contained" startIcon={<PersonAddRounded />} className={cx('addBtn')}>
          Mời thành viên
        </Button>
      </Box>

      {/* --- GRID LIST --- */}
      <Grid container spacing={3}>
        {members.map((member, index) => (
          <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={member.id}>
            <Paper className={cx('memberCard')} elevation={0}>
              <div className={cx('cardHeader')}>
                <IconButton size="small" className={cx('moreBtn')}>
                  <MoreVertRounded />
                </IconButton>
              </div>

              <div className={cx('cardBody')}>
                <div className={cx('avatarWrapper')}>
                  <Avatar className={cx('avatar')} src={member.avatar}></Avatar>
                  {member.role === 'Leader' && (
                    <div className={cx('badge')}>
                      <VerifiedUserRounded />
                    </div>
                  )}
                </div>

                <Typography className={cx('memberName')}>{member.name || member.fullName || '-'}</Typography>

                <Chip label={member.role || member.position || '-'} size="small" className={cx('roleChip')} />

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

      {projects.length > 0 && (
        <Box className={cx('projectSection')}>
          <Typography className={cx('sectionTitle')}>Dự án đang tham gia</Typography>

          <Box className={cx('projectList')}>
            {projects.map((project) => (
              <MangaCard key={project.id} manga={project} />
            ))}
          </Box>
        </Box>
      )}
    </div>
  );
}
