import { useEffect, useRef, useState } from 'react';
import { User, Group, Role, Permission, Resource } from '@/app/App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface RelationshipDiagramProps {
  users: User[];
  groups: Group[];
  roles: Role[];
  permissions: Permission[];
  resources: Resource[];
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  type: 'user' | 'group' | 'role' | 'permission' | 'resource';
}

export function RelationshipDiagram({
  users,
  groups,
  roles,
  permissions,
  resources,
}: RelationshipDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());

  const columnWidth = 180;
  const nodeHeight = 50;
  const verticalSpacing = 15;
  const headerHeight = 60;

  useEffect(() => {
    calculateNodePositions();
  }, [users, groups, roles, permissions, resources]);

  // 递归查找所有相关的节点
  useEffect(() => {
    if (!hoveredNode) {
      setHighlightedNodes(new Set());
      return;
    }

    const highlighted = new Set<string>();
    highlighted.add(hoveredNode);

    const nodePos = getNodePosition(hoveredNode);
    if (!nodePos) return;

    // 递归函数：从当前节点向右查找所有相关节点
    const findRelatedNodes = (nodeId: string, nodeType: string) => {
      highlighted.add(nodeId);

      switch (nodeType) {
        case 'user':
          // 用户 → 组
          const user = users.find(u => u.id === nodeId);
          if (user) {
            user.groupIds.forEach(groupId => {
              findRelatedNodes(groupId, 'group');
            });
          }
          break;

        case 'group':
          // 组 → 角色
          const group = groups.find(g => g.id === nodeId);
          if (group) {
            group.roleIds.forEach(roleId => {
              findRelatedNodes(roleId, 'role');
            });
          }
          break;

        case 'role':
          // 角色 → 权限
          const role = roles.find(r => r.id === nodeId);
          if (role) {
            role.permissionIds.forEach(permissionId => {
              findRelatedNodes(permissionId, 'permission');
            });
          }
          break;

        case 'permission':
          // 权限 → 资源
          const permission = permissions.find(p => p.id === nodeId);
          if (permission) {
            findRelatedNodes(permission.resourceId, 'resource');
          }
          break;

        case 'resource':
          // 资源是终点，不需要继续
          break;
      }
    };

    findRelatedNodes(hoveredNode, nodePos.type);
    setHighlightedNodes(highlighted);
  }, [hoveredNode, users, groups, roles, permissions, resources]);

  const calculateNodePositions = () => {
    const positions: NodePosition[] = [];
    const startX = 50;

    // 计算每列的节点位置
    // 第1列：用户
    users.forEach((user, index) => {
      positions.push({
        id: user.id,
        x: startX,
        y: headerHeight + index * (nodeHeight + verticalSpacing),
        type: 'user',
      });
    });

    // 第2列：组
    groups.forEach((group, index) => {
      positions.push({
        id: group.id,
        x: startX + columnWidth,
        y: headerHeight + index * (nodeHeight + verticalSpacing),
        type: 'group',
      });
    });

    // 第3列：角色
    roles.forEach((role, index) => {
      positions.push({
        id: role.id,
        x: startX + columnWidth * 2,
        y: headerHeight + index * (nodeHeight + verticalSpacing),
        type: 'role',
      });
    });

    // 第4列：权限
    permissions.forEach((permission, index) => {
      positions.push({
        id: permission.id,
        x: startX + columnWidth * 3,
        y: headerHeight + index * (nodeHeight + verticalSpacing),
        type: 'permission',
      });
    });

    // 第5列：资源
    resources.forEach((resource, index) => {
      positions.push({
        id: resource.id,
        x: startX + columnWidth * 4,
        y: headerHeight + index * (nodeHeight + verticalSpacing),
        type: 'resource',
      });
    });

    setNodePositions(positions);
  };

  const getNodePosition = (id: string): NodePosition | undefined => {
    return nodePositions.find((pos) => pos.id === id);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'user':
        return '#3b82f6'; // blue
      case 'group':
        return '#8b5cf6'; // purple
      case 'role':
        return '#10b981'; // green
      case 'permission':
        return '#f59e0b'; // orange
      case 'resource':
        return '#ef4444'; // red
      default:
        return '#6b7280';
    }
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    let keyIndex = 0;

    // 用户 -> 组的连接
    users.forEach((user) => {
      const userPos = getNodePosition(user.id);
      if (!userPos) return;

      user.groupIds.forEach((groupId) => {
        const groupPos = getNodePosition(groupId);
        if (!groupPos) return;

        const isHighlighted =
          highlightedNodes.has(user.id) && highlightedNodes.has(groupId);

        connections.push(
          <line
            key={`user-group-${keyIndex++}`}
            x1={userPos.x + 150}
            y1={userPos.y + nodeHeight / 2}
            x2={groupPos.x}
            y2={groupPos.y + nodeHeight / 2}
            stroke={isHighlighted ? getNodeColor('user') : '#cbd5e1'}
            strokeWidth={isHighlighted ? 3 : 1}
            opacity={isHighlighted ? 0.9 : 0.3}
            className="transition-all duration-200"
          />
        );
      });
    });

    // 组 -> 角色的连接
    groups.forEach((group) => {
      const groupPos = getNodePosition(group.id);
      if (!groupPos) return;

      group.roleIds.forEach((roleId) => {
        const rolePos = getNodePosition(roleId);
        if (!rolePos) return;

        const isHighlighted =
          highlightedNodes.has(group.id) && highlightedNodes.has(roleId);

        connections.push(
          <line
            key={`group-role-${keyIndex++}`}
            x1={groupPos.x + 150}
            y1={groupPos.y + nodeHeight / 2}
            x2={rolePos.x}
            y2={rolePos.y + nodeHeight / 2}
            stroke={isHighlighted ? getNodeColor('group') : '#cbd5e1'}
            strokeWidth={isHighlighted ? 3 : 1}
            opacity={isHighlighted ? 0.9 : 0.3}
            className="transition-all duration-200"
          />
        );
      });
    });

    // 角色 -> 权限的连接
    roles.forEach((role) => {
      const rolePos = getNodePosition(role.id);
      if (!rolePos) return;

      role.permissionIds.forEach((permissionId) => {
        const permissionPos = getNodePosition(permissionId);
        if (!permissionPos) return;

        const isHighlighted =
          highlightedNodes.has(role.id) && highlightedNodes.has(permissionId);

        connections.push(
          <line
            key={`role-permission-${keyIndex++}`}
            x1={rolePos.x + 150}
            y1={rolePos.y + nodeHeight / 2}
            x2={permissionPos.x}
            y2={permissionPos.y + nodeHeight / 2}
            stroke={isHighlighted ? getNodeColor('role') : '#cbd5e1'}
            strokeWidth={isHighlighted ? 3 : 1}
            opacity={isHighlighted ? 0.9 : 0.3}
            className="transition-all duration-200"
          />
        );
      });
    });

    // 权限 -> 资源的连接
    permissions.forEach((permission) => {
      const permissionPos = getNodePosition(permission.id);
      if (!permissionPos) return;

      const resourcePos = getNodePosition(permission.resourceId);
      if (!resourcePos) return;

      const isHighlighted =
        highlightedNodes.has(permission.id) && highlightedNodes.has(permission.resourceId);

      connections.push(
        <line
          key={`permission-resource-${keyIndex++}`}
          x1={permissionPos.x + 150}
          y1={permissionPos.y + nodeHeight / 2}
          x2={resourcePos.x}
          y2={resourcePos.y + nodeHeight / 2}
          stroke={isHighlighted ? getNodeColor('permission') : '#cbd5e1'}
          strokeWidth={isHighlighted ? 3 : 1}
          opacity={isHighlighted ? 0.9 : 0.3}
          className="transition-all duration-200"
        />
      );
    });

    return connections;
  };

  const renderNode = (
    id: string,
    name: string,
    type: 'user' | 'group' | 'role' | 'permission' | 'resource',
    description?: string
  ) => {
    const pos = getNodePosition(id);
    if (!pos) return null;

    const isHovered = hoveredNode === id;
    const isHighlighted = highlightedNodes.has(id);
    const color = getNodeColor(type);

    return (
      <g
        key={id}
        onMouseEnter={() => setHoveredNode(id)}
        onMouseLeave={() => setHoveredNode(null)}
        className="cursor-pointer"
      >
        <rect
          x={pos.x}
          y={pos.y}
          width={150}
          height={nodeHeight}
          rx={6}
          fill={isHighlighted && !isHovered ? `${color}10` : 'white'}
          stroke={color}
          strokeWidth={isHovered ? 3 : isHighlighted ? 2 : 1}
          className="transition-all duration-200"
          style={{
            filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' : 'none',
          }}
        />
        <text
          x={pos.x + 75}
          y={pos.y + 22}
          textAnchor="middle"
          className="text-sm"
          fill={isHighlighted ? color : '#1e293b'}
          style={{ fontWeight: isHighlighted ? 600 : 500 }}
        >
          {name.length > 12 ? name.substring(0, 12) + '...' : name}
        </text>
        {description && (
          <text
            x={pos.x + 75}
            y={pos.y + 38}
            textAnchor="middle"
            className="text-xs"
            fill={isHighlighted ? color : '#64748b'}
          >
            {description.length > 15 ? description.substring(0, 15) + '...' : description}
          </text>
        )}
      </g>
    );
  };

  const maxHeight = Math.max(
    users.length,
    groups.length,
    roles.length,
    permissions.length,
    resources.length
  ) * (nodeHeight + verticalSpacing) + headerHeight + 50;

  return (
    <Card>
      <CardHeader>
        <CardTitle>关系图谱</CardTitle>
        <CardDescription>五元组关系可视化展示：用户 → 组 → 角色 → 权限 → 资源</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 图例 */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getNodeColor('user') }}
            />
            <span className="text-sm text-slate-600">用户</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getNodeColor('group') }}
            />
            <span className="text-sm text-slate-600">组</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getNodeColor('role') }}
            />
            <span className="text-sm text-slate-600">角色</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getNodeColor('permission') }}
            />
            <span className="text-sm text-slate-600">权限</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getNodeColor('resource') }}
            />
            <span className="text-sm text-slate-600">资源</span>
          </div>
        </div>

        {/* SVG 画布 */}
        <div className="overflow-x-auto border rounded-lg bg-slate-50 p-4">
          <svg
            ref={svgRef}
            width={columnWidth * 5 + 100}
            height={maxHeight}
            className="bg-white rounded"
          >
            {/* 列标题 */}
            <text
              x={50 + 75}
              y={30}
              textAnchor="middle"
              className="text-sm"
              fill={getNodeColor('user')}
              style={{ fontWeight: 600 }}
            >
              用户
            </text>
            <text
              x={50 + columnWidth + 75}
              y={30}
              textAnchor="middle"
              className="text-sm"
              fill={getNodeColor('group')}
              style={{ fontWeight: 600 }}
            >
              组
            </text>
            <text
              x={50 + columnWidth * 2 + 75}
              y={30}
              textAnchor="middle"
              className="text-sm"
              fill={getNodeColor('role')}
              style={{ fontWeight: 600 }}
            >
              角色
            </text>
            <text
              x={50 + columnWidth * 3 + 75}
              y={30}
              textAnchor="middle"
              className="text-sm"
              fill={getNodeColor('permission')}
              style={{ fontWeight: 600 }}
            >
              权限
            </text>
            <text
              x={50 + columnWidth * 4 + 75}
              y={30}
              textAnchor="middle"
              className="text-sm"
              fill={getNodeColor('resource')}
              style={{ fontWeight: 600 }}
            >
              资源
            </text>

            {/* 连接线 */}
            <g>{renderConnections()}</g>

            {/* 节点 */}
            {users.map((user) => renderNode(user.id, user.name, 'user', user.email))}
            {groups.map((group) => renderNode(group.id, group.name, 'group', group.description))}
            {roles.map((role) => renderNode(role.id, role.name, 'role', role.description))}
            {permissions.map((permission) =>
              renderNode(permission.id, permission.name, 'permission', permission.action)
            )}
            {resources.map((resource) =>
              renderNode(resource.id, resource.name, 'resource', resource.type)
            )}
          </svg>
        </div>

        {/* 说明 */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>使用提示：</strong>将鼠标悬停在节点上会递归高亮显示所有相关的节点和连接线。例如悬停在用户上，会同时高亮该用户关联的组、角色、权限和资源。
          </p>
        </div>

        {/* 统计信息 */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg text-center" style={{ color: getNodeColor('user') }}>
              {users.length}
            </div>
            <div className="text-xs text-center text-slate-600 mt-1">用户数</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-lg text-center" style={{ color: getNodeColor('group') }}>
              {groups.length}
            </div>
            <div className="text-xs text-center text-slate-600 mt-1">组数</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg text-center" style={{ color: getNodeColor('role') }}>
              {roles.length}
            </div>
            <div className="text-xs text-center text-slate-600 mt-1">角色数</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-lg text-center" style={{ color: getNodeColor('permission') }}>
              {permissions.length}
            </div>
            <div className="text-xs text-center text-slate-600 mt-1">权限数</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-lg text-center" style={{ color: getNodeColor('resource') }}>
              {resources.length}
            </div>
            <div className="text-xs text-center text-slate-600 mt-1">资源数</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}