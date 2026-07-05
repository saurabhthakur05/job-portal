import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Company from './models/Company.js';
import Job from './models/Job.js';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Promise.all([User.deleteMany({}), Company.deleteMany({}), Job.deleteMany({})]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@jobportal.com',
    password: 'admin123',
    role: 'admin',
    isVerified: true,
  });

  const recruiter = await User.create({
    name: 'Jane Recruiter',
    email: 'recruiter@jobportal.com',
    password: 'recruiter123',
    role: 'recruiter',
    isVerified: true,
    isRecruiterVerified: true,
  });

  const jobseeker = await User.create({
    name: 'John Seeker',
    email: 'seeker@jobportal.com',
    password: 'seeker123',
    role: 'jobseeker',
    isVerified: true,
    profile: {
      summary: 'Full-stack developer with 5 years of experience building web applications.',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
      location: 'San Francisco, CA',
      experience: [{
        company: 'TechCorp',
        title: 'Senior Developer',
        current: true,
        description: 'Led development of microservices architecture serving 1M+ users.',
      }],
      education: [{
        institution: 'State University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
      }],
    },
  });

  const companies = await Company.insertMany([
    { name: 'Google', description: 'Technology company specializing in search and cloud services.', location: 'Mountain View, CA', industry: 'Technology', employeeCount: '100,000+', isApproved: true, isVerified: true, owner: recruiter._id, recruiters: [recruiter._id], averageRating: 4.5, totalReviews: 120 },
    { name: 'Microsoft', description: 'Leading software and cloud computing company.', location: 'Redmond, WA', industry: 'Technology', employeeCount: '200,000+', isApproved: true, isVerified: true, owner: recruiter._id, recruiters: [recruiter._id], averageRating: 4.3, totalReviews: 95 },
    { name: 'Stripe', description: 'Online payment processing platform.', location: 'San Francisco, CA', industry: 'Fintech', employeeCount: '5,000+', isApproved: true, owner: recruiter._id, recruiters: [recruiter._id], averageRating: 4.7, totalReviews: 45 },
    { name: 'Airbnb', description: 'Online marketplace for lodging and tourism.', location: 'San Francisco, CA', industry: 'Travel', employeeCount: '6,000+', isApproved: true, owner: recruiter._id, recruiters: [recruiter._id], averageRating: 4.2, totalReviews: 67 },
  ]);

  await User.findByIdAndUpdate(recruiter._id, { company: companies[0]._id });

  const jobs = [
    { title: 'Senior Software Engineer', description: 'We are looking for a Senior Software Engineer to join our team. You will design and build scalable web applications using React and Node.js.', skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'], location: 'Remote', workMode: 'remote', jobType: 'full-time', salary: { min: 120000, max: 180000 }, experience: { min: 3, max: 8 }, isFeatured: true },
    { title: 'Frontend Developer', description: 'Join our frontend team to build beautiful, responsive user interfaces with React and Tailwind CSS.', skills: ['React', 'JavaScript', 'CSS', 'Tailwind'], location: 'New York, NY', workMode: 'hybrid', jobType: 'full-time', salary: { min: 90000, max: 130000 }, experience: { min: 2, max: 5 }, isFeatured: true },
    { title: 'DevOps Engineer', description: 'Manage cloud infrastructure on AWS, implement CI/CD pipelines, and ensure system reliability.', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], location: 'Austin, TX', workMode: 'onsite', jobType: 'full-time', salary: { min: 110000, max: 160000 }, experience: { min: 3, max: 7 } },
    { title: 'Data Analyst', description: 'Analyze large datasets, create dashboards, and provide insights to drive business decisions.', skills: ['Python', 'SQL', 'Tableau', 'Data Analysis'], location: 'Chicago, IL', workMode: 'hybrid', jobType: 'full-time', salary: { min: 70000, max: 100000 }, experience: { min: 1, max: 4 }, isFeatured: true },
    { title: 'Product Manager', description: 'Lead product strategy, work with engineering and design teams to deliver exceptional products.', skills: ['Product Management', 'Agile', 'Communication'], location: 'San Francisco, CA', workMode: 'hybrid', jobType: 'full-time', salary: { min: 130000, max: 190000 }, experience: { min: 4, max: 10 } },
    { title: 'UX Designer', description: 'Create intuitive user experiences through research, wireframing, and prototyping.', skills: ['Figma', 'UI/UX', 'User Research'], location: 'Remote', workMode: 'remote', jobType: 'full-time', salary: { min: 85000, max: 120000 }, experience: { min: 2, max: 6 } },
  ];

  for (let i = 0; i < jobs.length; i++) {
    const company = companies[i % companies.length];
    await Job.create({
      ...jobs[i],
      company: company._id,
      companyName: company.name,
      recruiter: recruiter._id,
      requirements: ['Strong communication skills', 'Team player', 'Self-motivated'],
      responsibilities: ['Write clean, maintainable code', 'Collaborate with cross-functional teams', 'Participate in code reviews'],
    });
  }

  console.log('\nSeed data created successfully!\n');
  console.log('Demo Accounts:');
  console.log('  Admin:     admin@jobportal.com / admin123');
  console.log('  Recruiter: recruiter@jobportal.com / recruiter123');
  console.log('  Seeker:    seeker@jobportal.com / seeker123');
  console.log(`\nCreated ${companies.length} companies and ${jobs.length} jobs`);

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
