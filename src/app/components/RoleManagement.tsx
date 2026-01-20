import { useState } from 'react';
import { Role, Permission } from '@/app/App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
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
import { ShieldPlus, Edit, Trash2 } from 'lucide-react';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/components/ui/accordion';

interface RoleManagementProps {
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  permissions: Permission[];
}

export function RoleManagement({ roles, setRoles, permissions }: RoleManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[],
  });

  const handleAddRole = () => {
    const newRole: Role = {
      id: `r${Date.now()}`,
      ...formData,
    };
    setRoles([...roles, newRole]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleUpdateRole = () => {
    if (!editingRole) return;
    setRoles(roles.map((r) => (r.id === editingRole.id ? { ...r, ...formData } : r)));
    setEditingRole(null);
    resetForm();
  };

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissionIds: [],
    });
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissionIds: role.permissionIds,
    });
  };

  const togglePermission = (permissionId: string) => {
    setFormData({
      ...formData,
      permissionIds: formData.permissionIds.includes(permissionId)
        ? formData.permissionIds.filter((id) => id !== permissionId)
        : [...formData.permissionIds, permissionId],
    });
  };

  // 按资源分组权限
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const resourceName = permission.resourceId || 'Other';
    if (!acc[resourceName]) {
      acc[resourceName] = [];
    }
    acc[resourceName].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>角色列表</CardTitle>
            <CardDescription>管理系统角色并为角色分配权限</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <ShieldPlus className="w-4 h-4 mr-2" />
                添加角色
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>添加新角色</DialogTitle>
                <DialogDescription>创建角色并分配相应的权限</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">角色名称</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="输入角色名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="输入角色描述"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>分配权限</Label>
                  <Accordion type="multiple" className="w-full border rounded-lg">
                    {Object.entries(groupedPermissions).map(([resource, perms]) => (
                      <AccordionItem key={resource} value={resource}>
                        <AccordionTrigger className="px-4">
                          <div className="flex items-center gap-2">
                            <span>{resource}</span>
                            <Badge variant="outline">
                              {perms.filter((p) => formData.permissionIds.includes(p.id)).length}/
                              {perms.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-2">
                            {perms.map((permission) => (
                              <div key={permission.id} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`perm-${permission.id}`}
                                  checked={formData.permissionIds.includes(permission.id)}
                                  onCheckedChange={() => togglePermission(permission.id)}
                                />
                                <div className="flex-1">
                                  <label
                                    htmlFor={`perm-${permission.id}`}
                                    className="text-sm cursor-pointer block"
                                  >
                                    {permission.name}
                                  </label>
                                  <p className="text-xs text-slate-500">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleAddRole}>确定</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <Card key={role.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <CardDescription className="mt-1">{role.description}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Dialog
                      open={editingRole?.id === role.id}
                      onOpenChange={(open) => !open && setEditingRole(null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(role)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>编辑角色</DialogTitle>
                          <DialogDescription>修改角色信息及权限分配</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">角色名称</Label>
                            <Input
                              id="edit-name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-description">描述</Label>
                            <Textarea
                              id="edit-description"
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                              }
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>分配权限</Label>
                            <Accordion type="multiple" className="w-full border rounded-lg">
                              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                                <AccordionItem key={resource} value={resource}>
                                  <AccordionTrigger className="px-4">
                                    <div className="flex items-center gap-2">
                                      <span>{resource}</span>
                                      <Badge variant="outline">
                                        {
                                          perms.filter((p) =>
                                            formData.permissionIds.includes(p.id)
                                          ).length
                                        }
                                        /{perms.length}
                                      </Badge>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-4 pb-4">
                                    <div className="space-y-2">
                                      {perms.map((permission) => (
                                        <div
                                          key={permission.id}
                                          className="flex items-start space-x-2"
                                        >
                                          <Checkbox
                                            id={`edit-perm-${permission.id}`}
                                            checked={formData.permissionIds.includes(
                                              permission.id
                                            )}
                                            onCheckedChange={() => togglePermission(permission.id)}
                                          />
                                          <div className="flex-1">
                                            <label
                                              htmlFor={`edit-perm-${permission.id}`}
                                              className="text-sm cursor-pointer block"
                                            >
                                              {permission.name}
                                            </label>
                                            <p className="text-xs text-slate-500">
                                              {permission.description}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingRole(null)}>
                            取消
                          </Button>
                          <Button onClick={handleUpdateRole}>保存</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">权限列表：</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissionIds.map((permId) => {
                      const permission = permissions.find((p) => p.id === permId);
                      return permission ? (
                        <Badge key={permId} variant="secondary" className="text-xs">
                          {permission.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    共 {role.permissionIds.length} 个权限
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}