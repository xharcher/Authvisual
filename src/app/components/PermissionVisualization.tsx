import { useState } from 'react';
import { User, Role, Permission } from '@/app/App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Users, Shield, Key, TrendingUp } from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';

interface PermissionVisualizationProps {
  users: User[];
  roles: Role[];
  permissions: Permission[];
}

export function PermissionVisualization({
  users,
  roles,
  permissions,
}: PermissionVisualizationProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');

  const selectedUser = users.find((u) => u.id === selectedUserId);
  
  // 获取用户的所有权限（通过角色）
  const getUserPermissions = (user: User | undefined): Permission[] => {
    if (!user) return [];
    const userRoles = roles.filter((role) => user.roleIds.includes(role.id));
    const permissionIds = new Set<string>();
    userRoles.forEach((role) => {
      role.permissionIds.forEach((id) => permissionIds.add(id));
    });
    return permissions.filter((p) => permissionIds.has(p.id));
  };

  const userPermissions = getUserPermissions(selectedUser);

  // 按资源分组权限
  const groupedPermissions = userPermissions.reduce((acc, permission) => {
    const resourceName = permission.resourceId || 'Other';
    if (!acc[resourceName]) {
      acc[resourceName] = [];
    }
    acc[resourceName].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // 计算统计数据
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === 'active').length,
    totalRoles: roles.length,
    totalPermissions: permissions.length,
    avgPermissionsPerRole:
      roles.length > 0
        ? Math.round(
            roles.reduce((sum, role) => sum + role.permissionIds.length, 0) / roles.length
          )
        : 0,
  };

  // 角色使用统计
  const roleUsage = roles.map((role) => ({
    role,
    userCount: users.filter((u) => u.roleIds.includes(role.id)).length,
  }));

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">总用户数</p>
                <p className="text-2xl mt-1">{stats.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.activeUsers} 个启用
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">总角色数</p>
                <p className="text-2xl mt-1">{stats.totalRoles}</p>
                <p className="text-xs text-slate-500 mt-1">系统角色</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">总权限数</p>
                <p className="text-2xl mt-1">{stats.totalPermissions}</p>
                <p className="text-xs text-slate-500 mt-1">系统权限</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Key className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">平均权限数</p>
                <p className="text-2xl mt-1">{stats.avgPermissionsPerRole}</p>
                <p className="text-xs text-slate-500 mt-1">每个角色</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 角色使用情况 */}
      <Card>
        <CardHeader>
          <CardTitle>角色使用情况</CardTitle>
          <CardDescription>各角色分配的用户数量统计</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roleUsage.map(({ role, userCount }) => {
              const percentage = stats.totalUsers > 0 ? (userCount / stats.totalUsers) * 100 : 0;
              return (
                <div key={role.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{role.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {role.permissionIds.length} 权限
                      </Badge>
                    </div>
                    <span className="text-sm text-slate-500">
                      {userCount} 个用户 ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 用户权限详情 */}
      <Card>
        <CardHeader>
          <CardTitle>用户权限详情</CardTitle>
          <CardDescription>查看特定用户拥有的所有权限</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-600 mb-2 block">选择用户</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUser && (
              <>
                {/* 用户角色 */}
                <div>
                  <p className="text-sm text-slate-600 mb-2">分配的角色：</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.roleIds.map((roleId) => {
                      const role = roles.find((r) => r.id === roleId);
                      return role ? (
                        <Badge key={roleId} className="text-sm">
                          {role.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* 权限覆盖率 */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">权限覆盖率</span>
                    <span className="text-sm">
                      {userPermissions.length} / {permissions.length}
                    </span>
                  </div>
                  <Progress
                    value={(userPermissions.length / permissions.length) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    该用户拥有系统 {((userPermissions.length / permissions.length) * 100).toFixed(1)}% 的权限
                  </p>
                </div>

                {/* 权限列表（按资源分组） */}
                <div>
                  <p className="text-sm text-slate-600 mb-3">拥有的权限：</p>
                  {Object.keys(groupedPermissions).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(groupedPermissions).map(([resource, perms]) => (
                        <div key={resource} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary">{resource}</Badge>
                            <span className="text-xs text-slate-500">
                              {perms.length} 个权限
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {perms.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-start gap-2 p-2 bg-slate-50 rounded"
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm">{permission.name}</p>
                                  <p className="text-xs text-slate-500 truncate">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <p>该用户暂无任何权限</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}