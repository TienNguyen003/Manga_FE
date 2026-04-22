import {
  AddRounded,
  DeleteOutlineRounded,
  DescriptionRounded,
  FacebookRounded,
  GroupRounded,
  ImageRounded,
  LibraryBooksRounded,
  LinkRounded,
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
import DataTablePagination from '~/components/common/DataTablePagination';
import ConfirmDeleteModal from '~/components/common/ConfirmDeleteModal';

const cx = classNames.bind(styles);

export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [editing, setEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    totalItemsPerPage: 10,
  });
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
  }, [page.currentPage, page.totalItemsPerPage]);

  const loadTeams = async () => {
    try {
      const response = await adminService.getTeams({
        page: page.currentPage + 1,
        size: page.totalItemsPerPage,
      });
      const data = response?.result || [];
      const newPage = response?.page || {};
      setPage((prev) => ({
        ...prev,
        totalPages: newPage.totalPages,
        totalItems: newPage.totalItems,
      }));
      setTeams(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách nhóm dịch.');
    }
  };

  const handleSaveTeam = async () => {
    try {
      if (editing) {
        await adminService.updateTeam(newTeam.id, newTeam);
        toast.success('Cập nhật thông tin nhóm dịch thành công!');
      } else {
        await adminService.createTeam(newTeam);
        toast.success('Tạo nhóm dịch mới thành công!');
      }
      setOpenModal(false);
      setEditing(false);
      loadTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể lưu thông tin nhóm dịch.');
    }
  };

  const handleEditTeam = async (teamId) => {
    try {
      const response = await adminService.getTeam(teamId);
      const teamData = response?.result;
      setNewTeam(teamData);
      setEditing(true);
      setOpenModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải thông tin nhóm dịch.');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await adminService.deleteTeam(teamId);
      toast.success('Giải tán nhóm dịch thành công!');
      loadTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể giải tán nhóm dịch.');
    }
  };

  return (
    <div className={cx('pageContainer')}>
      {/* --- HEADER --- */}
      <header className={cx('header')}>
        <Box>
          <Typography className={cx('title')}>Nhóm Dịch Hệ Thống</Typography>
          <Typography className={cx('subtitle')}>Quản lý các tổ chức dịch thuật và cộng tác viên.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          className={cx('primaryBtn')}
          onClick={() => {
            setOpenModal(true);
            setNewTeam({});
          }}
        >
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
                      <IconButton size="small" className={cx('iconBtn')} onClick={() => handleEditTeam(team.id)}>
                        <SettingsRounded />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Giải tán nhóm">
                      <IconButton
                        size="small"
                        className={cx('iconBtn', 'delete')}
                        onClick={() => {
                          setIsDeleteOpen(true);
                          setNewTeam(team);
                        }}
                      >
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
      <DataTablePagination page={page} setPage={setPage} />

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth PaperProps={{ className: cx('premiumModal') }}>
        <Box className={cx('modalHeader')}>
          <Typography variant="h5" className={cx('modalTitle')}>
            {editing ? 'Cập nhật thông tin Team' : 'Tạo nhóm mới'}
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
                value={newTeam.name}
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
                value={newTeam.avatar}
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
                value={newTeam.banner}
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
                value={JSON.stringify(newTeam.socialLinks)}
                className={cx('premiumInput')}
                placeholder="Liên kết (JSON): { 'facebook': 'fb.com/username', 'discord': 'twitter.com/username' }"
                multiline
                rows={3}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <LinkRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => {
                  try {
                    setNewTeam({ ...newTeam, socialLinks: JSON.parse(e.target.value) });
                  } catch {}
                }}
              />

              <TextField
                className={cx('premiumInput')}
                placeholder="Giới thiệu ngắn về Team..."
                value={newTeam.description}
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
          <Button variant="contained" className={cx('primaryBtn')} onClick={handleSaveTeam}>
            {editing ? 'Cập nhật' : 'Tạo nhóm'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Giải tán nhóm dịch"
        content={`Bạn có chắc chắn muốn giải tán nhóm <strong>${newTeam.name}</strong>? Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến nhóm.`}
        onConfirm={() => {
          handleDeleteTeam(newTeam.id);
          setIsDeleteOpen(false);
        }}
      />
    </div>
  );
}
