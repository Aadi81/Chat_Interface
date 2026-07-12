export default function OnlineUsersBar({ users, currentUsername, connected }) {
  return (
    <div className="online-bar">
      <span className={`connection-dot ${connected ? 'online' : 'offline'}`} />
      <span className="online-label">
        {connected ? 'Online' : 'Connecting...'}
      </span>
      <div className="online-users">
        {users.map((user) => (
          <span
            key={user}
            className={`online-chip ${user === currentUsername ? 'self' : ''}`}
          >
            {user}
          </span>
        ))}
      </div>
    </div>
  );
}
