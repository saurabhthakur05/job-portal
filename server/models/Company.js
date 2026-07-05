import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: String,
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    logo: String,
    coverImage: String,
    description: String,
    industry: String,
    website: String,
    location: String,
    employeeCount: String,
    founded: Number,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recruiters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isApproved: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String,
    },
  },
  { timestamps: true }
);

companySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

companySchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
    return;
  }
  this.totalReviews = this.reviews.length;
  this.averageRating =
    this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
};

const Company = mongoose.model('Company', companySchema);
export default Company;
