import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Star, MapPin, Globe, Users } from 'lucide-react';
import api from '../../services/api';
import JobCard from '../../components/jobs/JobCard';
import { PageLoader } from '../../components/ui/Spinner';

const CompanyDetailsPage = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);

  useEffect(() => {
    api.get(`/companies/${id}`).then((r) => {
      setCompany(r.data.company);
      setJobs(r.data.jobs);
    }).finally(() => setLoading(false));
  }, [id]);
  const handleLogoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    setUploading(true);

    const formData = new FormData();
    formData.append("logo", file);

    const { data } = await api.post(
      `/companies/${company._id}/logo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setCompany({
      ...company,
      logo: data.logo,
    });

    alert("Company logo updated successfully!");
  } catch (err) {
    alert(err.response?.data?.message || "Failed to upload logo.");
  } finally {
    setUploading(false);
  }
};
const handleDeleteCompany = async () => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this company?\n\nThis will also delete all jobs posted under this company."
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/companies/${company._id}`);

    alert("Company deleted successfully!");

    window.location.href = "/companies";
  } catch (err) {
    alert(err.response?.data?.message || "Failed to delete company.");
  }
};
  if (loading) return <PageLoader />;
  if (!company) return <div className="text-center py-20">Company not found</div>;

  const isOwner =
  user &&
  (
    company.owner?._id === user._id ||
    company.owner === user._id ||
    company.recruiters?.some(
      (r) => (r._id || r).toString() === user._id
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="glass-card mb-8">
        <div className="flex flex-col md:flex-row gap-6">
         <div className="flex flex-col items-center gap-3">
  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shrink-0 overflow-hidden">
    {company.logo ? (
      <img
        src={company.logo}
        alt=""
        className="w-full h-full object-cover"
      />
    ) : (
      company.name[0]
    )}
  </div>

  {isOwner && (
    <>
      <input
        type="file"
        id="companyLogo"
        accept="image/*"
        className="hidden"
        onChange={handleLogoUpload}
      />

      <label
        htmlFor="companyLogo"
        className="btn-secondary cursor-pointer text-sm"
      >
        {uploading ? "Uploading..." : "Upload Logo"}
      </label>
    </>
  )}
</div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <div className="flex flex-wrap gap-4 mt-3 text-gray-500">
              {company.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{company.location}</span>}
              {company.website && <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-600"><Globe className="w-4 h-4" />Website</a>}
              {company.employeeCount && <span className="flex items-center gap-1"><Users className="w-4 h-4" />{company.employeeCount} employees</span>}
              <span className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-current" />{company.averageRating?.toFixed(1)} ({company.totalReviews} reviews)</span>
            </div>
            {company.description && <p className="mt-4 text-gray-600 dark:text-gray-400">{company.description}</p>}
           {isOwner && (
  <div className="flex gap-3 mt-6">
    <Link
      to={`/recruiter/jobs?company=${company._id}`}
      className="btn-primary"
    >
      💼 Post Jobs
    </Link>

    <button
      onClick={handleDeleteCompany}
      className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
    >
      🗑 Delete Company
    </button>
  </div>
)}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Open Positions ({jobs.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job, i) => <JobCard key={job._id} job={job} index={i} />)}
      </div>
      {jobs.length === 0 && <p className="text-gray-500 text-center py-12">No open positions at the moment</p>}
    </div>
  );
};

export default CompanyDetailsPage;
