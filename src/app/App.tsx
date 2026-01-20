import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { UserManagement } from '@/app/components/UserManagement';
import { RoleManagement } from '@/app/components/RoleManagement';
import { PermissionMatrix } from '@/app/components/PermissionMatrix';
import { PermissionVisualization } from '@/app/components/PermissionVisualization';
import { RelationshipDiagram } from '@/app/components/RelationshipDiagram';
import { Shield } from 'lucide-react';

// 模拟数据类型
export interface User {
  id: string;
  name: string;
  email: string;
  groupIds: string[];
  roleIds: string[];
  status: 'active' | 'inactive';
}

export interface Group {
  id: string;
  name: string;
  description: string;
  roleIds: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
}

export interface Permission {
  id: string;
  name: string;
  resourceId: string;
  action: string;
  description: string;
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  type: string;
}

export default function App() {
  // 初始化资源数据
  const [resources] = useState<Resource[]>([
    { id: 'res1', name: '用户管理', description: '用户管理模块', type: 'module' },
    { id: 'res2', name: '角色管理', description: '角色管理模块', type: 'module' },
    { id: 'res3', name: '数据分析', description: '数据分析模块', type: 'module' },
    { id: 'res4', name: '系统设置', description: '系统设置模块', type: 'module' },
  ]);

  // 初始化权限数据
  const [permissions] = useState<Permission[]>([
    { id: 'p1', name: '查看用户', resourceId: 'res1', action: 'read', description: '可以查看用户列表和详情' },
    { id: 'p2', name: '创建用户', resourceId: 'res1', action: 'create', description: '可以创建新用户' },
    { id: 'p3', name: '编辑用户', resourceId: 'res1', action: 'update', description: '可以编辑用户信息' },
    { id: 'p4', name: '删除用户', resourceId: 'res1', action: 'delete', description: '可以删除用户' },
    { id: 'p5', name: '查看角色', resourceId: 'res2', action: 'read', description: '可以查看角色列表和详情' },
    { id: 'p6', name: '创建角色', resourceId: 'res2', action: 'create', description: '可以创建新角色' },
    { id: 'p7', name: '编辑角色', resourceId: 'res2', action: 'update', description: '可以编辑角色信息' },
    { id: 'p8', name: '删除角色', resourceId: 'res2', action: 'delete', description: '可以删除角色' },
    { id: 'p9', name: '查看报表', resourceId: 'res3', action: 'read', description: '可以查看数据报表' },
    { id: 'p10', name: '导出数据', resourceId: 'res3', action: 'export', description: '可以导出数据' },
    { id: 'p11', name: '系统配置', resourceId: 'res4', action: 'manage', description: '可以修改系统配置' },
    { id: 'p12', name: '日志查看', resourceId: 'res4', action: 'read', description: '可以查看系统日志' },
  ]);

  // 初始化角色数据
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'r1',
      name: '超级管理员',
      description: '拥有系统所有权限',
      permissionIds: permissions.map(p => p.id),
    },
    {
      id: 'r2',
      name: '用户管理员',
      description: '管理用户和角色',
      permissionIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'],
    },
    {
      id: 'r3',
      name: '数据分析师',
      description: '查看和分析数据',
      permissionIds: ['p1', 'p9', 'p10', 'p12'],
    },
    {
      id: 'r4',
      name: '普通用户',
      description: '基础查看权限',
      permissionIds: ['p1', 'p5', 'p9'],
    },
  ]);

  // 初始化组数据
  const [groups] = useState<Group[]>([
    {
      id: 'g1',
      name: '管理组',
      description: '系统管理员组',
      roleIds: ['r1', 'r2'],
    },
    {
      id: 'g2',
      name: '测试组',
      description: '测试人员组',
      roleIds: ['r3', 'r4'],
    },
    {
      id: 'g3',
      name: '开发组',
      description: '开发人员组',
      roleIds: ['r2', 'r3'],
    },
  ]);

  // 初始化用户数据
  const [users, setUsers] = useState<User[]>([
    {
      id: 'u1',
      name: '张三',
      email: 'zhangsan@example.com',
      groupIds: ['g1'],
      roleIds: ['r1'],
      status: 'active',
    },
    {
      id: 'u2',
      name: '李四',
      email: 'lisi@example.com',
      groupIds: ['g1'],
      roleIds: ['r2'],
      status: 'active',
    },
    {
      id: 'u3',
      name: '王五',
      email: 'wangwu@example.com',
      groupIds: ['g2'],
      roleIds: ['r3', 'r4'],
      status: 'active',
    },
    {
      id: 'u4',
      name: '赵六',
      email: 'zhaoliu@example.com',
      groupIds: ['g3'],
      roleIds: ['r4'],
      status: 'inactive',
    },
    {
      id: 'u5',
      name: '孙七',
      email: 'sunqi@example.com',
      groupIds: ['g2', 'g3'],
      roleIds: ['r3'],
      status: 'active',
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl text-slate-900">权限管理系统</h1>
          </div>
          <p className="text-slate-600">统一管理用户、角色和权限，可视化展示权限分配关系</p>
        </div>

        {/* 主要内容区域 */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="roles">角色管理</TabsTrigger>
            <TabsTrigger value="matrix">权限矩阵</TabsTrigger>
            <TabsTrigger value="visualization">可视化展示</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement
              users={users}
              setUsers={setUsers}
              roles={roles}
            />
          </TabsContent>

          <TabsContent value="roles">
            <RoleManagement
              roles={roles}
              setRoles={setRoles}
              permissions={permissions}
            />
          </TabsContent>

          <TabsContent value="matrix">
            <PermissionMatrix
              roles={roles}
              permissions={permissions}
              setRoles={setRoles}
            />
          </TabsContent>

          <TabsContent value="visualization">
            <PermissionVisualization
              users={users}
              roles={roles}
              permissions={permissions}
            />
            <div className="mt-6">
              <RelationshipDiagram
                users={users}
                groups={groups}
                roles={roles}
                permissions={permissions}
                resources={resources}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}