import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  User,
  Upload,
  Building2,
  Phone,
  MapPin
} from 'lucide-react';
import api from '../../services/api';
import { fetchUser } from '../../store/store';
import { PageLoader } from '../../components/ui/Spinner';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [skills, setSkills] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then((r) => {
      setProfile(r.data.user.profile || {});
      setSkills(r.data.user.profile?.skills?.join(', ') || '');
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', {
        profile: { ...profile, skills: skills.split(',').map((s) => s.trim()).filter(Boolean) },
      });
      dispatch(fetchUser());
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const handleAvatar = async (e) => {
    const formData = new FormData();
    formData.append('avatar', e.target.files[0]);
    await api.post('/users/avatar', formData);
    dispatch(fetchUser());
    toast.success('Avatar updated');
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="section-title mb-8">Profile Settings</h1>

      <div className="glass-card mb-6 flex items-center gap-6">
        <div className="relative">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary-500 flex items-center justify-center"><User className="w-10 h-10 text-white" /></div>
          )}
          <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700">
            <Upload className="w-4 h-4 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-sm text-primary-600 mt-1 capitalize">{user?.role}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-card space-y-4">
       {user?.role === "jobseeker" && (
  <div>
    <label className="block text-sm font-medium mb-1">
      Professional Summary
    </label>

    <textarea
      className="input-field min-h-[100px]"
      value={profile.summary || ""}
      onChange={(e) =>
        setProfile({ ...profile, summary: e.target.value })
      }
    />
  </div>
)}
        <div className="flex items-center gap-2 mb-4">
  <User className="w-5 h-5 text-primary-600" />
  <h3 className="text-lg font-bold text-primary-600">
    Contact Information
  </h3>
</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input className="input-field" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input className="input-field" value={profile.location || ''} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
          </div>
        </div>
        {user?.role === "recruiter" && (
  <div className="border-t pt-6 mt-2">
   <div className="flex items-center gap-2 mb-4">
  <Building2 className="w-5 h-5 text-primary-600" />
  <h3 className="text-lg font-bold text-primary-600">
    Company Information
  </h3>
</div>
  </div>
)}
        {user?.role === "recruiter" && (
  <div>
    <label className="block text-sm font-medium mb-1">
      Designation
    </label>

    <input
      className="input-field"
      placeholder="HR Manager"
      value={profile.designation || ""}
      onChange={(e) =>
        setProfile({
          ...profile,
          designation: e.target.value,
        })
      }
    />
  </div>
)}
{user?.role === "recruiter" && (
  <div>
    <label className="block text-sm font-medium mb-1">
      Company Name
    </label>

    <input
      className="input-field"
      placeholder="ABC Technologies Pvt. Ltd."
      value={profile.companyName || ""}
      onChange={(e) =>
        setProfile({
          ...profile,
          companyName: e.target.value,
        })
      }
    />
  </div>
)}
{user?.role === "recruiter" && (
  <div>
    <label className="block text-sm font-medium mb-1">
      Company Website
    </label>

    <input
      className="input-field"
      type="url"
      placeholder="https://www.company.com"
      value={profile.companyWebsite || ""}
      onChange={(e) =>
        setProfile({
          ...profile,
          companyWebsite: e.target.value,
        })
      }
    />
  </div>
)}
{user?.role === "recruiter" && (
  <div>
    <label className="block text-sm font-medium mb-1">
      Company Description
    </label>

    <textarea
      className="input-field min-h-[120px]"
      placeholder="Tell candidates about your company..."
      value={profile.companyDescription || ""}
      onChange={(e) =>
        setProfile({
          ...profile,
          companyDescription: e.target.value,
        })
      }
    />
  </div>
)}
      {user?.role === "jobseeker" && (
  <div>
    <label className="block text-sm font-medium mb-1">
      Skills (comma separated)
    </label>

    <input
      className="input-field"
      value={skills}
      onChange={(e) => setSkills(e.target.value)}
      placeholder="JavaScript, React, Node.js"
    />
  </div>
)}
       {user?.role === "jobseeker" && (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium mb-1">GitHub</label>
      <input
        className="input-field"
        value={profile.github || ""}
        onChange={(e) =>
          setProfile({ ...profile, github: e.target.value })
        }
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">LinkedIn</label>
      <input
        className="input-field"
        value={profile.linkedin || ""}
        onChange={(e) =>
          setProfile({ ...profile, linkedin: e.target.value })
        }
      />
    </div>
  </div>
)}
     {user?.role === "jobseeker" && (
  <div>
    <label className="block text-sm font-medium mb-1">
      Upload Resume
    </label>

    <input
      type="file"
      accept=".pdf,.doc,.docx"
      className="input-field"
      onChange={async (e) => {
        const fd = new FormData();
        fd.append("resume", e.target.files[0]);
        await api.post("/users/resume", fd);
        toast.success("Resume uploaded");
      }}
    />
  </div>
)}
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Profile'}</button>
      </form>
    </div>
  );
};

export default ProfilePage;
