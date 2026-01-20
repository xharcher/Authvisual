import { useState } from 'react';
import { User, Role } from '@/app/App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { UserPlus, Edit, Trash2, Search } from 'lucide-react';
import { Checkbox } from '@/app/components/ui/checkbox';

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  roles: Role[];
}

export function UserManagement({ users, setUsers, roles }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    groupIds: [] as string[],
    roleIds: [] as string[],
    status: 'active' as 'active' | 'inactive',
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = () => {
    const newUser: User = {
      id: `u${Date.now()}`,
      ...formData,
    };
    setUsers([...users, newUser]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)));
    setEditingUser(null);
    resetForm();
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      groupIds: [],
      roleIds: [],
      status: 'active',
    });
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      groupIds: user.groupIds,
      roleIds: user.roleIds,
      status: user.status,
    });
  };

  const toggleRole = (roleId: string) => {
    setFormData({
      ...formData,
      roleIds: formData.roleIds.includes(roleId)
        ? formData.roleIds.filter((id) => id !== roleId)
        : [...formData.roleIds, roleId],
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>用户列表</CardTitle>
            <CardDescription>管理系统中的所有用户及其角色分配</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <UserPlus className="w-4 h-4 mr-2" />
                添加用户
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新用户</DialogTitle>
                <DialogDescription>填写用户信息并分配角色</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="输入用户姓名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="输入用户邮箱"
                  />
                </div>
                <div className="space-y-2">
                  <Label>分配角色</Label>
                  <div className="space-y-2 border rounded-lg p-3">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={formData.roleIds.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <label
                          htmlFor={`role-${role.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {role.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">状态</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive') =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">启用</SelectItem>
                      <SelectItem value="inactive">停用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleAddUser}>确定</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* 搜索栏 */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="搜索用户名或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 用户表格 */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {user.roleIds.map((roleId) => {
                      const role = roles.find((r) => r.id === roleId);
                      return role ? (
                        <Badge key={roleId} variant="secondary">
                          {role.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                    {user.status === 'active' ? '启用' : '停用'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Dialog
                      open={editingUser?.id === user.id}
                      onOpenChange={(open) => !open && setEditingUser(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>编辑用户</DialogTitle>
                          <DialogDescription>修改用户信息及角色分配</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">姓名</Label>
                            <Input
                              id="edit-name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-email">邮箱</Label>
                            <Input
                              id="edit-email"
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>分配角色</Label>
                            <div className="space-y-2 border rounded-lg p-3">
                              {roles.map((role) => (
                                <div key={role.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-role-${role.id}`}
                                    checked={formData.roleIds.includes(role.id)}
                                    onCheckedChange={() => toggleRole(role.id)}
                                  />
                                  <label
                                    htmlFor={`edit-role-${role.id}`}
                                    className="text-sm cursor-pointer flex-1"
                                  >
                                    {role.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-status">状态</Label>
                            <Select
                              value={formData.status}
                              onValueChange={(value: 'active' | 'inactive') =>
                                setFormData({ ...formData, status: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">启用</SelectItem>
                                <SelectItem value="inactive">停用</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingUser(null)}>
                            取消
                          </Button>
                          <Button onClick={handleUpdateUser}>保存</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}