'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Plus, Save, Trash2, Upload, X, Edit3, BookOpen, Users, Video, Tag, Percent } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/axios';
import Header from '../../../components/layout/Header';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

/* ─── Modal Component ──────────────────────────────────────────── */
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
        style={{ boxShadow: '0 0 60px rgba(255,215,0,0.08), 0 24px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4"
          style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #1f1f1f 100%)' }}>
          <h2 className="text-xl font-bold text-gold">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition hover:border-gold hover:text-gold"
          >
            <X size={16} />
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ─── Course Card ──────────────────────────────────────────────── */
function CourseCard({ course, onEdit, onDelete }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-gold/40 hover:shadow-lg"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden bg-secondary">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          : <div className="flex h-full items-center justify-center gap-2 text-muted">
              <BookOpen size={24} />
              <span className="text-sm">No thumbnail yet</span>
            </div>
        }
        <div className="absolute right-3 top-3">
          <Badge tone={course.isActive ? 'success' : 'error'}>{course.isActive ? 'Active' : 'Disabled'}</Badge>
        </div>
        {course.isBundle && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-gold/20 px-2 py-1 text-xs font-bold text-gold">BUNDLE</span>
          </div>
        )}
        {course.hasOffer && (
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-error/20 px-2 py-1 text-xs font-bold text-error">{course.offerPercent}% OFF</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-base font-bold leading-snug text-white">{course.title}</h2>
        {course.shortDescription && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{course.shortDescription}</p>
        )}

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center rounded-lg border border-border bg-secondary p-2 text-center">
            <span className="text-xs text-muted">Price</span>
            <span className="mt-0.5 font-mono text-sm font-bold text-gold">
              {course.isFree ? 'Free' : course.hasOffer
                ? <>
                    <span className="mr-1 text-xs text-muted line-through">₹{course.originalPrice}</span>
                    ₹{course.effectivePrice}
                  </>
                : `₹${course.price}`
              }
            </span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-border bg-secondary p-2 text-center">
            <Video size={12} className="text-muted" />
            <span className="mt-0.5 font-mono text-sm font-bold">{course.totalVideos ?? 0}</span>
            <span className="text-xs text-muted">Videos</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-border bg-secondary p-2 text-center">
            <Users size={12} className="text-muted" />
            <span className="mt-0.5 font-mono text-sm font-bold">{course.enrolledCount ?? 0}</span>
            <span className="text-xs text-muted">Enrolled</span>
          </div>
        </div>

        {/* Videos list */}
        {course.videos?.length > 0 && (
          <div className="mt-4 max-h-32 overflow-y-auto rounded-lg border border-border bg-secondary p-3 text-xs">
            {course.videos.map((v) => (
              <div key={v._id} className="flex items-center justify-between py-1">
                <span className="truncate text-white">{v.order}. {v.title}</span>
                <span className={v.isFreePreview ? 'ml-2 shrink-0 text-success' : 'ml-2 shrink-0 text-muted'}>
                  {v.isFreePreview ? 'Preview' : 'Locked'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={() => onEdit(course)}>
            <Edit3 size={14} /> Edit
          </Button>
          <Button variant="danger" onClick={() => onDelete(course._id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </article>
  );
}

/* ─── Course Form (used inside modal) ─────────────────────────── */
function CourseForm({ editing, onSave, onCancel }) {
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(e, thumbnailFile);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input name="title" label="Title" defaultValue={editing.title} required />
        <Input name="price" label="Price (₹)" type="number" defaultValue={editing.price} />
        <Input name="category" label="Category" defaultValue={editing.category} />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-muted">Thumbnail URL</label>
          <input
            name="thumbnail"
            defaultValue={editing.thumbnail}
            placeholder="https://..."
            className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-white placeholder-muted focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Upload thumbnail */}
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-secondary p-4 transition hover:border-gold/50">
        <ImagePlus size={20} className="text-gold" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gold">Upload Thumbnail Image</p>
          <p className="mt-0.5 text-xs text-muted">
            {thumbnailFile ? thumbnailFile.name : 'PNG or JPG — overrides URL field when selected'}
          </p>
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
      </label>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-muted">Short Description</label>
        <textarea name="shortDescription" rows={2} defaultValue={editing.shortDescription}
          className="w-full rounded-lg border border-border bg-secondary p-3 text-sm text-white placeholder-muted focus:border-gold focus:outline-none resize-none" />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-muted">Full Description</label>
        <textarea name="description" rows={3} defaultValue={editing.description}
          className="w-full rounded-lg border border-border bg-secondary p-3 text-sm text-white placeholder-muted focus:border-gold focus:outline-none resize-none" />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-muted">Learning Outcomes <span className="text-xs">(one per line)</span></label>
        <textarea name="outcomes" rows={3} defaultValue={(editing.outcomes || []).join('\n')}
          className="w-full rounded-lg border border-border bg-secondary p-3 text-sm text-white placeholder-muted focus:border-gold focus:outline-none resize-none" />
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-4">
        {[['isFree', 'Free Course', editing.isFree], ['isBundle', 'Bundle Course', editing.isBundle], ['isActive', 'Active / Visible', editing.isActive !== false]].map(([name, label, checked]) => (
          <label key={name} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm transition hover:border-gold/40">
            <input type="checkbox" name={name} defaultChecked={checked} className="accent-gold" />
            <span className="font-medium text-white">{label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3 border-t border-border pt-4">
        <Button disabled={saving}>{saving ? 'Saving…' : 'Save Course'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

/* ─── Main Page ────────────────────────────────────────────────── */
export default function CoursesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/admin/courses').then((r) => r.data),
  });

  const [editing, setEditing] = useState(null);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [video, setVideo] = useState({ courseId: '', title: '', file: null, isFreePreview: false });
  const [offer, setOffer] = useState({ scope: 'all', courseId: '', offerPercent: 0 });
  const [videoCourseImage, setVideoCourseImage] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // ── handlers ──
  async function saveCourse(e, thumbnailFile) {
    const body = Object.fromEntries(new FormData(e.currentTarget));
    if (thumbnailFile) {
      const image = new FormData();
      image.append('image', thumbnailFile);
      const upload = await api.post('/media', image, { headers: { 'Content-Type': 'multipart/form-data' } });
      body.thumbnail = upload.data.url;
    }
    body.price = Number(body.price || 0);
    body.isFree = body.isFree === 'on';
    body.isBundle = body.isBundle === 'on';
    body.isActive = body.isActive === 'on';
    body.outcomes = String(body.outcomes || '').split('\n').filter(Boolean);
    if (editing._id) await api.put(`/courses/${editing._id}`, body);
    else await api.post('/courses', body);
    toast.success('Course saved');
    setEditing(null);
    qc.invalidateQueries({ queryKey: ['courses'] });
  }

  async function deleteCourse(id) {
    if (!confirm('Delete this course?')) return;
    await api.delete(`/courses/${id}`);
    toast.success('Course deleted');
    qc.invalidateQueries({ queryKey: ['courses'] });
  }

  async function saveOffer(e) {
    e.preventDefault();
    await api.put('/admin/courses/offers', { ...offer, offerActive: Number(offer.offerPercent) > 0 });
    toast.success('Offer updated');
    qc.invalidateQueries({ queryKey: ['courses'] });
  }

  async function clearOffers() {
    await api.put('/admin/courses/offers', { scope: 'all', offerPercent: 0, offerActive: false });
    setOffer({ scope: 'all', courseId: '', offerPercent: 0 });
    toast.success('All offers cleared');
    qc.invalidateQueries({ queryKey: ['courses'] });
  }

  async function uploadVideo(e) {
    e.preventDefault();
    setUploadingVideo(true);
    try {
      const fd = new FormData();
      Object.entries(video).forEach(([k, v]) => v !== null && fd.append(k === 'file' ? 'video' : k, v));
      await api.post('/videos/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (videoCourseImage && video.courseId) {
        const image = new FormData();
        image.append('image', videoCourseImage);
        const upload = await api.post('/media', image, { headers: { 'Content-Type': 'multipart/form-data' } });
        await api.put(`/courses/${video.courseId}`, { thumbnail: upload.data.url });
      }
      toast.success('Video uploaded to Bunny Stream');
      setVideo({ courseId: '', title: '', file: null, isFreePreview: false });
      setVideoCourseImage(null);
      setShowVideoUpload(false);
      qc.invalidateQueries({ queryKey: ['courses'] });
    } finally {
      setUploadingVideo(false);
    }
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>;

  const courses = data?.courses || [];
  const bundle = courses.find((c) => c.isBundle);
  const regularCourses = courses.filter((c) => !c.isBundle);

  return (
    <>
      <Header
        title="Courses"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowVideoUpload(true)}>
              <Upload size={16} /> Upload Video
            </Button>
            <Button onClick={() => setEditing({ title: '', price: 0, isActive: true })}>
              <Plus size={16} /> Add Course
            </Button>
          </div>
        }
      />

      <main className="space-y-6 p-8">
        {/* Bundle Deal Banner */}
        {bundle && (
          <section className="relative overflow-hidden rounded-xl border border-gold/60 p-5"
            style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,215,0,0.03) 100%)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-gold/60">Bundle Deal</div>
                <div className="mt-1 text-2xl font-black text-gold">{bundle.title}</div>
                <div className="mt-1 font-mono text-muted">₹{bundle.price} · Save Rs 1996</div>
              </div>
              <Button variant="outline" onClick={() => setEditing(bundle)}>
                <Edit3 size={14} /> Edit Bundle
              </Button>
            </div>
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/5" />
          </section>
        )}

        {/* Course Offers */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Percent size={18} className="text-gold" />
                <h2 className="text-lg font-bold text-white">Course Offers</h2>
              </div>
              <p className="mt-1 text-sm text-muted">Apply a percentage discount to one course or every paid course.</p>
            </div>
            <Button type="button" variant="outline" onClick={clearOffers}>Clear All Offers</Button>
          </div>
          <form onSubmit={saveOffer} className="grid grid-cols-4 gap-4 items-end">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-muted">Apply To</span>
              <select
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-white focus:border-gold focus:outline-none"
                value={offer.scope}
                onChange={(e) => setOffer({ ...offer, scope: e.target.value })}
              >
                <option value="all">All paid courses</option>
                <option value="specific">Particular course</option>
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-muted">Course</span>
              <select
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-white focus:border-gold focus:outline-none disabled:opacity-50"
                value={offer.courseId}
                onChange={(e) => setOffer({ ...offer, courseId: e.target.value })}
                disabled={offer.scope === 'all'}
              >
                <option value="">Select course</option>
                {courses.filter((c) => !c.isBundle && !c.isFree).map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </label>
            <Input label="Discount %" type="number" min="0" max="99" value={offer.offerPercent}
              onChange={(e) => setOffer({ ...offer, offerPercent: e.target.value })} />
            <Button>Apply Offer</Button>
          </form>
        </section>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <BookOpen size={40} className="text-muted" />
            <p className="mt-4 text-lg font-semibold text-white">No courses yet</p>
            <p className="mt-1 text-sm text-muted">Add your first course to get started</p>
            <Button className="mt-4" onClick={() => setEditing({ title: '', price: 0, isActive: true })}>
              <Plus size={16} /> Add Course
            </Button>
          </div>
        ) : (
          <>
            {regularCourses.length > 0 && (
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                {regularCourses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    onEdit={setEditing}
                    onDelete={deleteCourse}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Edit / Add Course Modal ── */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?._id ? `Edit: ${editing.title}` : 'Add New Course'}
      >
        {editing && (
          <CourseForm
            editing={editing}
            onSave={saveCourse}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      {/* ── Upload Video Modal ── */}
      <Modal
        open={showVideoUpload}
        onClose={() => setShowVideoUpload(false)}
        title="Upload Video to Bunny Stream"
      >
        <form onSubmit={uploadVideo} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2 text-sm col-span-2">
              <span className="font-medium text-muted">Select Course</span>
              <select
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-white focus:border-gold focus:outline-none"
                value={video.courseId}
                onChange={(e) => setVideo({ ...video, courseId: e.target.value })}
                required
              >
                <option value="">Choose a course…</option>
                {courses.filter((c) => !c.isBundle).map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </label>
            <Input label="Video Title" value={video.title} onChange={(e) => setVideo({ ...video, title: e.target.value })} required />
            <label className="space-y-2 text-sm">
              <span className="font-medium text-muted">Video File</span>
              <input
                type="file"
                accept="video/*"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-1 file:text-xs file:font-bold file:text-black"
                onChange={(e) => setVideo({ ...video, file: e.target.files?.[0] })}
                required
              />
            </label>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={video.isFreePreview} className="accent-gold"
              onChange={(e) => setVideo({ ...video, isFreePreview: e.target.checked })} />
            <span className="font-medium text-white">Mark as Free Preview</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-secondary p-4 transition hover:border-gold/50">
            <ImagePlus size={20} className="text-gold" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gold">Optional Course Thumbnail</p>
              <p className="mt-0.5 text-xs text-muted">
                {videoCourseImage ? videoCourseImage.name : 'Falls back to first Bunny video thumbnail if skipped'}
              </p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setVideoCourseImage(e.target.files?.[0] || null)} />
          </label>
          <div className="flex gap-3 border-t border-border pt-4">
            <Button disabled={uploadingVideo}>
              <Upload size={16} /> {uploadingVideo ? 'Uploading…' : 'Upload to Bunny'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowVideoUpload(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
