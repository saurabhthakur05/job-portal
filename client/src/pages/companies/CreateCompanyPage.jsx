import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const CreateCompanyPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    industry: "",
    website: "",
    location: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/companies", form);

      alert("Company created successfully!");

      navigate("/companies");
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to create company."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8">
        Create Company
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white rounded-xl shadow-lg p-8"
      >
        <input
          type="text"
          name="name"
          placeholder="Company Name"
          className="input-field w-full"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="industry"
          placeholder="Industry"
          className="input-field w-full"
          value={form.industry}
          onChange={handleChange}
          required
        />

        <input
          type="url"
          name="website"
          placeholder="Website"
          className="input-field w-full"
          value={form.website}
          onChange={handleChange}
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          className="input-field w-full"
          value={form.location}
          onChange={handleChange}
        />

        <textarea
          rows="5"
          name="description"
          placeholder="Company Description"
          className="input-field w-full"
          value={form.description}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Company"}
        </button>
      </form>
    </div>
  );
};

export default CreateCompanyPage;