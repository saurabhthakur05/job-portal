import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import CompanyCard from '../../components/companies/CompanyCard';
import { PageLoader } from '../../components/ui/Spinner';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [myCompany, setMyCompany] = useState(null);
  const { user } = useSelector((state) => state.auth);

  /*const fetch = async () => {
    setLoading(true);
    const { data } = await api.get(`/companies?search=${search}`);
    setCompanies(data.companies);
    setLoading(false);
  };*/
  const fetch = async () => {
  try {
    setLoading(true);

    const { data } = await api.get(`/companies?search=${search}`);

    console.log("API Response:", data);

    const companies = data.companies || [];

setCompanies(companies);

// Find the company owned by the logged-in recruiter
if (user?.role === "recruiter") {
  const owned = companies.find(
    (company) =>
      company.owner === user._id ||
      company.owner?._id === user._id
  );

  setMyCompany(owned || null);
}
  } catch (err) {
    console.error("Company fetch error:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetch(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
  <div>
    <h1 className="section-title mb-2">Explore Companies</h1>
    <p className="text-gray-500">
      Discover great places to work
    </p>
  </div>

 {user?.role === "admin" && (
  <Link
    to="/companies/create"
    className="btn-primary mt-4 md:mt-0"
  >
    + Create Company
  </Link>
)}

{user?.role === "recruiter" && (
  myCompany ? (
    <Link
      to={`/companies/${myCompany._id}`}
      className="btn-primary mt-4 md:mt-0"
    >
      🏢 My Company
    </Link>
  ) : (
    <Link
      to="/companies/create"
      className="btn-primary mt-4 md:mt-0"
    >
      + Create Company
    </Link>
  )
)}
</div>
      <form onSubmit={(e) => { e.preventDefault(); fetch(); }} className="flex gap-3 mb-8">
        <input className="input-field flex-1" placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn-primary">Search</button>
      </form>
      {loading ? <PageLoader /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {companies.map((c, i) => <CompanyCard key={c._id} company={c} index={i} />)}
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
