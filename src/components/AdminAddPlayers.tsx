import './admin-add-players.css'

const PLAYERS_LIST = [
  { username: 'nowak', fullName: 'Nowak Maciej', leagueLicense: '9000000009', email: 'nowak@witamed.local', isAdmin: false },
  { username: 'kozlowski', fullName: 'Kozłowski Maciej', leagueLicense: '9000000002', email: 'kozlowski@witamed.local', isAdmin: false },
  { username: 'jankowski', fullName: 'Jankowski Michał', leagueLicense: '9000000013', email: 'jankowski@witamed.local', isAdmin: false },
  { username: 'lewandowska', fullName: 'Lewandowski Mateusz', leagueLicense: '9000000011', email: 'lewandowska@witamed.local', isAdmin: false },
  { username: 'wozniak', fullName: 'Woźniak Piotr', leagueLicense: '9000000004', email: 'wozniak@witamed.local', isAdmin: false },
  { username: 'szymanska', fullName: 'Szymański Jakub', leagueLicense: '9000000014', email: 'szymanska@witamed.local', isAdmin: false },
  { username: 'kaminski', fullName: 'Kamiński Michał', leagueLicense: '9000000007', email: 'kaminski@witamed.local', isAdmin: false },
  { username: 'dabrowski', fullName: 'Dąbrowski Mateusz', leagueLicense: '9000000010', email: 'dabrowski@witamed.local', isAdmin: false },
  { username: 'zielinski', fullName: 'Zieliński Marcin', leagueLicense: '9000000005', email: 'zielinski@witamed.local', isAdmin: false },
  { username: 'michalski', fullName: 'Michalski Dominik', leagueLicense: '9000000001', email: 'michalski@witamed.local', isAdmin: false },
  { username: 'kowalczyk', fullName: 'Kowalczyk Łukasz', leagueLicense: '9000000006', email: 'kowalczyk@witamed.local', isAdmin: false },
  { username: 'wojcik', fullName: 'Wójcik Weronika', leagueLicense: '9000000015', email: 'wojcik@witamed.local', isAdmin: false },
  { username: 'zamachowski', fullName: 'Zamachowski Szymon', leagueLicense: '9000000012', email: 'zamachowski@witamed.local', isAdmin: true },
]

export default function AdminAddPlayers() {
  return (
    <div className="admin-add-players">
      <h3>Lista zawodników</h3>
      
      <p className="info-text">
        Poniżej znajduje się lista wszystkich {PLAYERS_LIST.length} zawodników z numerami legitymacji ligowej:
      </p>

      <div className="players-table-container">
        <table className="players-table">
          <thead>
            <tr>
              <th>Lp.</th>
              <th>Imię i nazwisko</th>
              <th>Username</th>
              <th>Email</th>
              <th>Numer legitymacji</th>
              <th>Rola</th>
            </tr>
          </thead>
          <tbody>
            {PLAYERS_LIST.map((player, index) => (
              <tr key={player.username}>
                <td>{index + 1}</td>
                <td>
                  <strong>{player.fullName}</strong>
                </td>
                <td>
                  <code>{player.username}</code>
                </td>
                <td>
                  <code>{player.email}</code>
                </td>
                <td>
                  <code>{player.leagueLicense}</code>
                </td>
                <td>
                  {player.isAdmin ? (
                    <span className="admin-badge">ADMIN</span>
                  ) : (
                    <span className="player-badge">Zawodnik</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="info-box">
        <p><strong>Informacje:</strong></p>
        <ul>
          <li>Hasło dla wszystkich zawodników: <code>HASLO_STARTOWE</code></li>
          <li>Logowanie odbywa się przez username lub email</li>
          <li>Email w formacie: <code>username@witamed.local</code></li>
        </ul>
      </div>
    </div>
  )
}

