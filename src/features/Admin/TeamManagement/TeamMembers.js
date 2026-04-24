import {
  AdminPanelSettings,
  AdminPanelSettingsRounded,
  ArrowBackRounded,
  CheckCircleRounded,
  ManageAccountsRounded,
  PersonAddRounded,
  PersonOutlineRounded,
  PersonRemove,
  SearchRounded,
  SecurityRounded,
  VerifiedUserRounded,
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
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmDeleteModal from '~/components/common/ConfirmDeleteModal';
import MangaCard from '~/components/common/MangaCard';
import { adminService } from '~/services/adminService';
import styles from './TeamMembers.module.scss';

const cx = classNames.bind(styles);

const ROLES = [
  {
    key: 'LEAD',
    title: 'Trưởng nhóm',
    desc: 'Quản lý toàn bộ nhóm, phân quyền, duyệt thành viên, hoạt động khác.',
    icon: <AdminPanelSettingsRounded />,
    color: '#ef4444',
  },
  {
    key: 'MODERATOR',
    title: 'Moderator',
    desc: 'Hỗ trợ trong việc quản lý thành viên, duyệt nội dung và giải quyết xung đột.',
    icon: <ManageAccountsRounded />,
    color: '#3b82f6',
  },
  {
    key: 'MEMBER',
    title: 'Member',
    desc: 'Truy cập và tham gia hoạt động của nhóm nhưng không có quyền quản lý.',
    icon: <PersonOutlineRounded />,
    color: '#10b981',
  },
];

export default function TeamMembers() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [teamInfo, setTeamInfo] = useState();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [members, setMembers] = useState([]);
  const [member, setMember] = useState({});
  const [projects, setProjects] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    if (id) loadMembers();
  }, [id]);

  useEffect(() => {
    if (isAddMemberOpen) loadSuggestedUsers();
  }, [isAddMemberOpen, searchKeyword]);

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

  const loadSuggestedUsers = async () => {
    try {
      const response = await adminService.getUsers({ page: 1, size: searchKeyword ? 999 : 3, keyword: searchKeyword });
      setSuggestedUsers(response?.result || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách người dùng gợi ý.');
    }
  };

  const handleAddTeamMember = async (userId) => {
    try {
      await adminService.addTeamMember(id, userId);
      toast.success('Thêm thành viên vào nhóm thành công!');
      // setIsAddMemberOpen(false);
      loadMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thêm thành viên vào nhóm.');
    }
  };

  const handleRemoveTeamMember = async (userId) => {
    try {
      await adminService.deleteTeamMember(id, userId);
      toast.success('Xóa thành viên khỏi nhóm thành công!');
      setIsRemoveOpen(false);
      loadMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa thành viên khỏi nhóm.');
    }
  };

  const handleAssignRole = async () => {
    try {
      await adminService.updateTeamMemberRole(id, member.id, {role: selectedRole});
      toast.success('Gán quyền thành viên thành công!');
      setIsAssignOpen(false);
      loadMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gán quyền cho thành viên.');
    }
  };

  const filteredUsers = useMemo(() => {
    const memberIds = new Set((members || []).map((m) => m.id));
    return (suggestedUsers || []).filter((user) => !memberIds.has(user.id));
  }, [members, suggestedUsers]);

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
        <Button variant="contained" startIcon={<PersonAddRounded />} className={cx('primaryBtn')} onClick={() => setIsAddMemberOpen(true)}>
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
                  <TableCell align="right">Thao tác</TableCell>
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
                      <Typography className={cx('dateText')}>{new Date(member.joinedAt).toLocaleString('vi-VN') || '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xóa khỏi nhóm">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setMember(member);
                            setIsRemoveOpen(true);
                          }}
                        >
                          <PersonRemove />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Gán quyền">
                        <IconButton
                          onClick={() => {
                            setIsAssignOpen(true);
                            setMember(member);
                            setSelectedRole('')
                          }}
                        >
                          <AdminPanelSettings fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
              <b>{new Date(teamInfo?.createdAt).toLocaleString('vi-VN') || 'Đang cập nhật'}</b>
            </div>
            <div className={cx('infoRow')}>
              <span>Dự án</span>
              <b>{projects.length} dự án</b>
            </div>
            <div className={cx('infoRow')}>
              <span>Trạng thái</span>
              <Chip label={teamInfo?.status ? 'Đang hoạt động' : 'Ngừng hoạt động'} size="small" color="success" variant="outlined" />
            </div>
          </div>

          {projects.length > 0 && (
            <div className={cx('sideCard')}>
              <Typography className={cx('sideTitle')}>Dự án gần đây</Typography>
              <Box className={cx('projectList')}>
                {projects.slice(0, 4).map((project) => (
                  <MangaCard key={project.id} manga={project} />
                ))}
              </Box>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} maxWidth="sm" fullWidth PaperProps={{ className: cx('roleModal') }}>
        <Box className={cx('modalHeader')}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box className={cx('headerIcon')} sx={{ color: '#ea982b' }}>
              <PersonAddRounded />
            </Box>
            <Box>
              <Typography variant="h6" className={cx('title')}>
                Thêm thành viên
              </Typography>
              <Typography variant="body2" className={cx('subtitle')}>
                Thêm người dùng vào nhóm: <strong>{teamInfo?.name}</strong>
              </Typography>
            </Box>
          </Stack>
        </Box>

        <DialogContent className={cx('modalBody')}>
          <Typography className={cx('sectionLabel')}>Tìm kiếm người dùng</Typography>

          {/* Input tìm kiếm người dùng (có thể dùng Autocomplete của MUI) */}
          <TextField
            fullWidth
            placeholder="Nhập tên hoặc email..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            variant="outlined"
            className={cx('searchField')}
            InputProps={{
              startAdornment: <SearchRounded sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            sx={{ position: 'sticky', top: 0, zIndex: 10 }}
          />

          <Typography className={cx('sectionLabel')} sx={{ mt: 3 }}>
            Danh sách gợi ý
          </Typography>
          <Stack spacing={1} className={cx('userList')}>
            {/* Giả sử bạn có danh sách users trả về từ API search */}
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Box key={user.id} className={cx('userRow', { active: selectedUserId === user.id })} onClick={() => setSelectedUserId(user.id)}>
                  <Avatar src={user.urlImage} sx={{ width: 40, height: 40 }} />
                  <Box sx={{ flex: 1, ml: 2 }}>
                    <Typography className={cx('userName')}>{user.name}</Typography>
                    <Typography className={cx('userEmail')}>{user.email}</Typography>
                  </Box>
                  <Button size="small" variant="outlined" className={cx('addBtn')} onClick={() => handleAddTeamMember(user.id)}>
                    Thêm
                  </Button>
                </Box>
              ))
            ) : (
              <Typography className={cx('noResults')}>Không tìm thấy người dùng nào.</Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions className={cx('modalFooter')}>
          <Button onClick={() => setIsAddMemberOpen(false)} className={cx('textBtn')}>
            Hủy
          </Button>
          {/* <Button variant="contained" className={cx('primaryBtn')}>
            Xác nhận thêm
          </Button> */}
        </DialogActions>
      </Dialog>

      <Dialog open={isAssignOpen} onClose={() => setIsAssignOpen(false)} maxWidth="sm" fullWidth PaperProps={{ className: cx('roleModal') }}>
        <Box className={cx('modalHeader')}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box className={cx('headerIcon')}>
              <SecurityRounded />
            </Box>
            <Box>
              <Typography variant="h6" className={cx('title')}>
                Phân quyền thành viên
              </Typography>
            </Box>
          </Stack>
        </Box>

        <DialogContent className={cx('modalBody')}>
          {/* User Preview */}
          <Box className={cx('userPreview')}>
            <Avatar src={member?.avatar} className={cx('userAvatar')} />
            <Box sx={{ flex: 1 }}>
              <Typography className={cx('userName')}>{member?.name}</Typography>
              <Typography className={cx('userEmail')}>{member?.email}</Typography>
            </Box>
            <Chip label={member?.role} size="small" color="primary" />
          </Box>

          <Typography className={cx('sectionLabel')}>Chọn vai trò mới</Typography>

          <Stack spacing={2} className={cx('roleList')}>
            {ROLES.map((role) => (
              <Box
                key={role.key}
                className={cx('roleCard', { active: selectedRole === role.key }, { available: role.key === member.role })}
                onClick={() => setSelectedRole(role.key)}
              >
                <Box className={cx('roleIcon')} sx={{ color: role.color, backgroundColor: `${role.color}15` }}>
                  {role.icon}
                </Box>
                <Box className={cx('roleInfo')}>
                  <Typography className={cx('roleTitle')}>{role.title}</Typography>
                  <Typography className={cx('roleDesc')}>{role.desc}</Typography>
                </Box>
                {selectedRole === role.key && <CheckCircleRounded className={cx('checkIcon')} />}
              </Box>
            ))}
          </Stack>

          <Typography className={cx('warningText')}>
            <AdminPanelSettingsRounded sx={{ mr: 1 }} />
            Lưu ý: Thay đổi vai trò có thể ảnh hưởng đến quyền truy cập và khả năng quản lý của người dùng. Quyền có nền màu xám là quyền hiện có của thành viên.
          </Typography>
        </DialogContent>

        <DialogActions className={cx('modalFooter')}>
          <Button onClick={() => setIsAssignOpen(false)} className={cx('textBtn')}>
            Hủy bỏ
          </Button>
          <Button variant="contained" className={cx('primaryBtn')} onClick={() => handleAssignRole()}>
            Xác nhận gán quyền
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteModal
        open={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        onConfirm={() => {
          handleRemoveTeamMember(member.id);
          setIsRemoveOpen(false);
        }}
        title="Xóa thành viên"
        content={`Bạn đang chuẩn bị xóa thành viên <strong>${member?.name}</strong>. Tiếp tục?`}
      />
    </div>
  );
}
