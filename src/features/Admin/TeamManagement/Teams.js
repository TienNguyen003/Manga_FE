import {
  AddRounded,
  DeleteOutlineRounded,
  DescriptionRounded,
  FacebookRounded,
  GroupRounded,
  ImageRounded,
  LibraryBooksRounded,
  SettingsRounded,
  SportsEsportsRounded,
  StarsRounded,
  WallpaperRounded,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import paths from '~/routes/paths';
import { adminService } from '~/services/adminService';
import styles from './Teams.module.scss';

const cx = classNames.bind(styles);

export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    banner: '',
    avatar: '',
    socialLinks: {
      facebook: '',
      discord: '',
      website: '',
    },
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await adminService.getTeams();
      const data = response?.result || [];
      setTeams(data);
    } catch {
      toast.error('Không thể tải danh sách nhóm dịch.');
    }
  };

  const handleSocialChange = (key, value) => {
    setNewTeam((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [key]: value,
      },
    }));
  };

  return (
    <div className={cx('pageContainer')}>
      {/* --- HEADER --- */}
      <header className={cx('header')}>
        <Box>
          <Typography className={cx('title')}>Nhóm Dịch Hệ Thống</Typography>
          <Typography className={cx('subtitle')}>Quản lý các tổ chức dịch thuật và cộng tác viên.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} className={cx('primaryBtn')} onClick={() => setOpenModal(true)}>
          Thành lập nhóm
        </Button>
      </header>

      {/* --- TABLE AREA --- */}
      <TableContainer component={Paper} className={cx('tableWrapper')} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nhóm dịch</TableCell>
              <TableCell>Trưởng nhóm</TableCell>
              <TableCell>Quy mô</TableCell>
              <TableCell>Dự án đang thực hiện</TableCell>
              <TableCell align="right">Quản trị</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id} className={cx('tableRow')}>
                <TableCell>
                  <Box className={cx('teamInfo')}>
                    <Avatar className={cx('teamAvatar')} sx={{ bgcolor: team.color }} src={team.avatar} />
                    <Typography className={cx('teamName')}>{team.name || team.title || '-'}</Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip icon={<StarsRounded sx={{ color: `${team.color || '#ea982b'} !important` }} />} label={team.leader || team.owner || '-'} className={cx('leaderChip')} />
                </TableCell>

                <TableCell>
                  <Box className={cx('memberBox')}>
                    <GroupRounded className={cx('icon')} />
                    <Typography>
                      <b>{team.members.length || 0}</b> thành viên
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box className={cx('projectBox')}>
                    <LibraryBooksRounded className={cx('icon')} />
                    <Typography>
                      <b>{team.projects.length || 0}</b> tác phẩm
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

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth PaperProps={{ className: cx('premiumModal') }}>
        <Box className={cx('modalHeader')}>
          <Typography variant="h5" className={cx('modalTitle')}>
            Cấu hình thông tin Team
          </Typography>
        </Box>

        <DialogContent className={cx('modalBody')}>
          <Box className={cx('formGrid')}>
            {/* CỘT 1: NHẬN DIỆN NHÓM */}
            <Stack spacing={3}>
              <Typography className={cx('sectionLabel')}>Nhận diện thương hiệu</Typography>

              <TextField
                className={cx('premiumInput')}
                placeholder="Tên nhóm (Team Name) *"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              />

              <TextField
                className={cx('premiumInput')}
                placeholder="Link ảnh đại diện (Avatar URL) *"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewTeam({ ...newTeam, avatar: e.target.value })}
              />

              <TextField
                className={cx('premiumInput')}
                placeholder="Link ảnh bìa nhóm (Banner URL) *"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WallpaperRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewTeam({ ...newTeam, banner: e.target.value })}
              />
            </Stack>

            {/* CỘT 2: MÔ TẢ & MẠNG XÃ HỘI */}
            <Stack spacing={3}>
              <Typography className={cx('sectionLabel')}>Liên kết & Mô tả</Typography>

              <TextField
                className={cx('premiumInput')}
                placeholder="Facebook URL"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FacebookRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => handleSocialChange('facebook', e.target.value)}
              />

              <TextField
                className={cx('premiumInput')}
                placeholder="Discord Invite Link"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SportsEsportsRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => handleSocialChange('discord', e.target.value)}
              />

              <TextField
                className={cx('premiumInput')}
                placeholder="Giới thiệu ngắn về Team..."
                fullWidth
                multiline
                rows={3}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <DescriptionRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
              />
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions className={cx('modalFooter')}>
          <Button onClick={() => setOpenModal(false)} className={cx('textBtn')}>
            Hủy
          </Button>
          <Button variant="contained" className={cx('primaryBtn')}>
            Lưu thông tin Team
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
