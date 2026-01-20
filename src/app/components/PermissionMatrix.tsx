import { Role, Permission } from '@/app/App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import React from 'react';

interface PermissionMatrixProps {
  roles: Role[];
  permissions: Permission[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

export function PermissionMatrix({ roles, permissions, setRoles }: PermissionMatrixProps) {
  const togglePermission = (roleId: string, permissionId: string) => {
    setRoles(
      roles.map((role) => {
        if (role.id !== roleId) return role;
        const hasPermission = role.permissionIds.includes(permissionId);
        return {
          ...role,
          permissionIds: hasPermission
            ? role.permissionIds.filter((id) => id !== permissionId)
            : [...role.permissionIds, permissionId],
        };
      })
    );
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
        <CardTitle>权限矩阵</CardTitle>
        <CardDescription>快速查看和管理角色与权限的对应关系</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] sticky left-0 bg-white z-10">
                  权限 / 角色
                </TableHead>
                {roles.map((role) => (
                  <TableHead key={role.id} className="text-center min-w-[120px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm">{role.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {role.permissionIds.length}个权限
                      </Badge>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <React.Fragment key={resource}>
                  <TableRow className="bg-slate-50">
                    <TableCell
                      colSpan={roles.length + 1}
                      className="sticky left-0 z-10 bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <Badge>{resource}</Badge>
                        <span className="text-xs text-slate-500">
                          {perms.length} 个权限
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                  {perms.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="sticky left-0 bg-white z-10">
                        <div>
                          <div className="text-sm">{permission.name}</div>
                          <div className="text-xs text-slate-500">
                            {permission.description}
                          </div>
                        </div>
                      </TableCell>
                      {roles.map((role) => {
                        const hasPermission = role.permissionIds.includes(permission.id);
                        return (
                          <TableCell key={role.id} className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={hasPermission}
                                onCheckedChange={() =>
                                  togglePermission(role.id, permission.id)
                                }
                              />
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 统计信息 */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl text-center">{roles.length}</div>
              <div className="text-xs text-center text-slate-500 mt-1">总角色数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl text-center">{permissions.length}</div>
              <div className="text-xs text-center text-slate-500 mt-1">总权限数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl text-center">
                {roles.reduce((sum, role) => sum + role.permissionIds.length, 0)}
              </div>
              <div className="text-xs text-center text-slate-500 mt-1">已分配权限</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl text-center">
                {Object.keys(groupedPermissions).length}
              </div>
              <div className="text-xs text-center text-slate-500 mt-1">权限模块</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}