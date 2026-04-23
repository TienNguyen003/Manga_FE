import { 
  ArrowBackRounded, MailRounded, MoreVertRounded, PersonAddRounded, 
  PhoneRounded, VerifiedUserRounded, SearchRounded 
} from '@mui/icons-material';
import { Avatar, Box, Button, Chip, IconButton, Typography, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '~/services/adminService';
import styles from './TeamMembers.module.scss';
import { toast } from 'react-toastify';
import MangaCard from '~/components/common/MangaCard';

const cx = classNames.bind(styles);

export default function TeamMembers() {
  const navigate = useNavigate();
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
    <div className={cx('wrapper')}>
      {/* --- TOP NAV BAR --- */}
      <div className={cx('topBar')}>
        <div className={cx('leftBar')}>
          <IconButton className={cx('backBtn')} onClick={() => navigate(-1)}>
            <ArrowBackRounded />
          </IconButton>
          <div>
            <Typography className={cx('teamName')}>{teamInfo?.name || 'Team'}</Typography>
            <Typography className={cx('teamDesc')}>{members.length} thành viên · Quản lý nhân sự</Typography>
          </div>
        </div>
        <Button variant="contained" startIcon={<PersonAddRounded />} className={cx('addBtn')}>
          Mời thành viên
        </Button>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className={cx('mainGrid')}>
        
        {/* --- LEFT: TABLE LIST --- */}
        <div className={cx('tableSection')}>
          <div className={cx('tableHeader')}>
            <Typography className={cx('sectionLabel')}>Danh sách nhân sự</Typography>
            <div className={cx('searchBox')}>
              <SearchRounded className={cx('searchIcon')} />
              <input type="text" placeholder="Tìm kiếm thành viên..." />
            </div>
          </div>

          <TableContainer>
            <Table className={cx('dataTable')}>
              <TableHead>
                <TableRow>
                  <TableCell>Thành viên</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Ngày tham gia</TableCell>
                  <TableCell>Liên hệ</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id} className={cx('dataRow')}>
                    <TableCell>
                      <div className={cx('userInfo')}>
                        <Avatar src={member.avatar} className={cx('userAvatar')}>
                          {member?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <span className={cx('userName')}>{member.name || member.fullName || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={member.role === 'Leader' ? <VerifiedUserRounded /> : null} 
                        label={member.role || member.position || '-'} 
                        size="small" 
                        className={cx(member.role === 'Leader' ? 'leaderChip' : 'memberChip')} 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography className={cx('dateText')}>{member.joinDate || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <div className={cx('actionGroup')}>
                        <Tooltip title="Email" arrow>
                          <IconButton size="small"><MailRounded /></IconButton>
                        </Tooltip>
                        <Tooltip title="Điện thoại" arrow>
                          <IconButton size="small"><PhoneRounded /></IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small"><MoreVertRounded /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* --- RIGHT: SIDEBAR --- */}
        <div className={cx('sidebar')}>
          <div className={cx('sideCard')}>
            <Typography className={cx('sideTitle')}>Thông tin nhóm</Typography>
            <div className={cx('infoRow')}>
              <span>Ngày tạo</span>
              <b>{teamInfo?.createdDate || 'Đang cập nhật'}</b>
            </div>
            <div className={cx('infoRow')}>
              <span>Dự án</span>
              <b>{projects.length} dự án</b>
            </div>
            <div className={cx('infoRow')}>
              <span>Trạng thái</span>
              <Chip label="Đang hoạt động" size="small" color="success" variant="outlined" />
            </div>
          </div>

          {projects.length > 0 && (
            <div className={cx('sideCard')}>
              <Typography className={cx('sideTitle')}>Dự án gần đây</Typography>
              <Box className={cx('projectList')}>
                {projects.map((project) => (
                  <MangaCard key={project.id} manga={project} />
                ))}
              </Box>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}