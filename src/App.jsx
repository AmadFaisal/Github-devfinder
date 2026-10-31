import { useEffect, useState, useTransition } from "react";
import { Search, Loader2, Users, BookOpen, ExternalLink, AlertCircle, MapPin } from
  "lucide-react";

export default function App() {
  const [username, setUsername] = useState();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestion, setSuggestion] = useState([]);

  const fetcGithubUser = async (searchName) => {
    if (!searchName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.github.com/users/${searchName}`);

      if (!response.ok) {
        throw new Error('User tidak ditemukan! Periksa kembali username.');
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
      setUser(null)
    } finally {
      setLoading(false)
    }
  };

  const fetchGithubSuggestions = async (searchName) => {
    if (!searchName?.trim()) {
      setSuggestion([]);
      return;
    }
    try {
      const res = await fetch(`https://api.github.com/search/users?q=${searchName}&per_page=5`);
      if (res.ok) {
        const data = await res.json();
        setSuggestion(data.items || []); //simpan 5 user teratas
      }
    } catch (err) {
      setSuggestion([]);
    }
  }

  useEffect(() => {
    // jika kolom kosong
    if (!username?.trim()) {
      setUser(null)
      setError(null)
      setSuggestion([]);
      return;
    }


    // pasang timer
    const timer = setTimeout(() => {
      fetcGithubUser(username)
      fetchGithubSuggestions(username)
    }, 600);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetcGithubUser(username)
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-xl">
        {/* header App */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Github <span className="text-indigo-400">DefFinder</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Cari developer dan temukan informasi statistik mereka langsung dari Github.
          </p>
        </div>

        {/* form pencarian */}
        <form onSubmit={handleSubmit} className="relative flex items-center mb-6">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ketik username Github (Misal: AmadFaisal, torvalds)..."
            className="w-full pl-12 pr-28 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm shadow-lg" />

          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-xs font-semibold rounded-lg transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari"}
          </button>
        </form>

        {/* deretan akun serupa */}
        {suggestion.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-slate-400 mb-2 font-medium">
              Akun serupa yang mungkin anda cari:
            </p>
            <div className="grid grid-cols-3 gap-1">
              {suggestion.map((item) => (
                <button type="button"
                  key={item.id}
                  onClick={() => { setUsername(item.login); fethGithubUser(item.login); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${item.login.toLowerCase() === user?.login?.toLowerCase()
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-700 hover:bg-slate-800'
                  }`}>
                    <img src={item.avatar_url} alt={item.login} className="w-4 h-4 rounded-full " />
                    <span className="">@{item.login}</span>

                </button>
              ))}
            </div>
          </div>
        )}

      {/* error message */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center gap-3 mb-6">
          <AlertCircle className="w-6 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* profile card */}
      {user && !loading && (
        <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img src={user.avatar_url} alt={user.name || user.login} className="w-24 h-24 rounded-full border-2 border-indigo-500/50 shadow-md object-cover" />
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-white tracking-tight
                ">
                {user.name || user.login}
              </h2>
              <a href={user.html_url} target="_blank"
                rel="noreferrer" className="text-indigo-400 text-sm font-medium hover:underline inline-flex items-center gap-1 mt-0.5">
                <span>@{user.login}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                {user.bio || 'Developer ini belum menambahkan bio di profile Github-nya.'}
              </p>
            </div>
          </div>

          {/* bagian tengah */}
          <div className="mt-6 grid grid-cols-3 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 text-center">
            <div>
              <span className="text-xs text-slate-500 font-medium">Repositories</span>
              <div className="text-lg font-bold text-white mt-0.5">{user.public_repos}</div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium"  >Followers</span>
              <div className="text-lg font-bold text-white mt-0.5">{user.followers}</div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium">Following</span>
              <div className="text-lg font-bold text-white mt-0.5">{user.following}</div>
            </div>
          </div>

          {/* bagian bawah */}
          <div className="mt-6 pt-5 border-t border-s-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>{user.location || 'Lokasi tidak disetel'}</span>
            </div>
            <a href={user.html_url}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto text-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700">
              Kunjungi Akun Github
            </a>
          </div>
        </div>
      )}

    </div>
    </div >
  )
}