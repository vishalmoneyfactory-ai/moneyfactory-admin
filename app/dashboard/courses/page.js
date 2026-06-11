'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Plus, Save, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/axios';
import Header from '../../../components/layout/Header';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export default function CoursesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['courses'], queryFn: () => api.get('/admin/courses').then((r) => r.data) });
  const [editing, setEditing] = useState(null);
  const [video, setVideo] = useState({ courseId: '', title: '', file: null, isFreePreview: false });
  const [offer, setOffer] = useState({ scope: 'all', courseId: '', offerPercent: 0 });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoCourseImage, setVideoCourseImage] = useState(null);

  async function saveCourse(e) {
    e.preventDefault();
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
    setThumbnailFile(null);
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
    toast.success('Offers cleared');
    qc.invalidateQueries({ queryKey: ['courses'] });
  }

  async function uploadVideo(e) {
    e.preventDefault();
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
    qc.invalidateQueries({ queryKey: ['courses'] });
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>;
  const courses = data?.courses || [];
  const bundle = courses.find((c) => c.isBundle);

  return (
    <>
      <Header title="Courses" action={<Button onClick={() => setEditing({ title: '', price: 0, isActive: true })}><Plus size={16} /> Add New Course</Button>} />
      <main className="space-y-6 p-8">
        {bundle && <section className="rounded-lg border border-gold bg-card p-5"><div className="text-sm text-muted">Bundle Deal</div><div className="mt-1 text-xl font-bold text-gold">{bundle.title}</div><div className="font-mono">Rs {bundle.price} · Save Rs 1996</div></section>}
        <section className="rounded-lg border border-gold/50 bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gold">Course Offers</h2>
              <p className="mt-1 text-sm text-muted">Apply a percentage discount to one course or every paid course. Users pay the discounted price immediately.</p>
            </div>
            <Button type="button" variant="outline" onClick={clearOffers}>Clear All Offers</Button>
          </div>
          <form onSubmit={saveOffer} className="grid grid-cols-4 gap-4">
            <label className="space-y-2 text-sm">
              <span>Apply To</span>
              <select className="w-full rounded-md px-3 py-2" value={offer.scope} onChange={(e) => setOffer({ ...offer, scope: e.target.value })}>
                <option value="all">All paid courses</option>
                <option value="specific">Particular course</option>
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span>Course</span>
              <select className="w-full rounded-md px-3 py-2" value={offer.courseId} onChange={(e) => setOffer({ ...offer, courseId: e.target.value })} disabled={offer.scope === 'all'}>
                <option value="">Select course</option>
                {courses.filter((c) => !c.isBundle && !c.isFree).map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </label>
            <Input label="Discount %" type="number" min="0" max="99" value={offer.offerPercent} onChange={(e) => setOffer({ ...offer, offerPercent: e.target.value })} />
            <Button>Apply Offer</Button>
          </form>
        </section>
        <div className="grid grid-cols-2 gap-4">
          {courses.map((course) => <article key={course._id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="text-lg font-bold">{course.title}</h2><p className="mt-1 text-sm text-muted">{course.shortDescription}</p></div>
              <Badge tone={course.isActive ? 'success' : 'error'}>{course.isActive ? 'Active' : 'Disabled'}</Badge>
            </div>
            <div className="mt-4 h-32 overflow-hidden rounded-md border border-border bg-secondary">
              {course.thumbnail ? <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-muted">Generated after first video</div>}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm"><div><span className="text-muted">Price</span><div className="font-mono text-gold">{course.hasOffer ? <><span className="mr-2 text-muted line-through">Rs {course.originalPrice}</span>Rs {course.effectivePrice}</> : <>Rs {course.price}</>}</div>{course.hasOffer && <div className="mt-1 text-xs text-success">{course.offerPercent}% offer active</div>}</div><div><span className="text-muted">Videos</span><div>{course.totalVideos}</div></div><div><span className="text-muted">Enrolled</span><div>{course.enrolledCount}</div></div></div>
            {course.videos?.length > 0 && <div className="mt-4 space-y-2 rounded-md border border-border p-3">{course.videos.map((v) => <div key={v._id} className="flex items-center justify-between text-sm"><span>{v.order}. {v.title}</span><span className={v.isFreePreview ? 'text-success' : 'text-muted'}>{v.isFreePreview ? 'Preview' : 'Locked'}</span></div>)}</div>}
            <div className="mt-4 flex gap-2"><Button onClick={() => setEditing(course)}><Save size={16} /> Edit</Button><Button variant="danger" onClick={async () => { await api.delete(`/courses/${course._id}`); qc.invalidateQueries({ queryKey: ['courses'] }); }}><Trash2 size={16} /> Delete</Button></div>
          </article>)}
        </div>
        {editing && <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-xl font-bold">Edit Course</h2>
          <form onSubmit={saveCourse} className="grid grid-cols-2 gap-4">
            <Input name="title" label="Title" defaultValue={editing.title} required />
            <Input name="price" label="Price" type="number" defaultValue={editing.price} />
            <Input name="thumbnail" label="Thumbnail URL" defaultValue={editing.thumbnail} />
            <Input name="category" label="Category" defaultValue={editing.category} />
            <label className="col-span-2 block rounded-md border border-dashed border-border bg-secondary p-4 text-sm">
              <span className="mb-2 flex items-center gap-2 font-semibold text-gold"><ImagePlus size={18} /> Upload Course Thumbnail</span>
              <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
              <span className="mt-2 block text-muted">{thumbnailFile ? thumbnailFile.name : 'PNG or JPG. This replaces the URL when selected.'}</span>
            </label>
            <label className="col-span-2 space-y-2 text-sm"><span>Short Description</span><textarea name="shortDescription" className="min-h-20 w-full rounded-md p-3" defaultValue={editing.shortDescription} /></label>
            <label className="col-span-2 space-y-2 text-sm"><span>Description</span><textarea name="description" className="min-h-28 w-full rounded-md p-3" defaultValue={editing.description} /></label>
            <label className="col-span-2 space-y-2 text-sm"><span>Learning Outcomes</span><textarea name="outcomes" className="min-h-24 w-full rounded-md p-3" defaultValue={(editing.outcomes || []).join('\n')} /></label>
            <label><input type="checkbox" name="isFree" defaultChecked={editing.isFree} /> Free</label><label><input type="checkbox" name="isBundle" defaultChecked={editing.isBundle} /> Bundle</label><label><input type="checkbox" name="isActive" defaultChecked={editing.isActive !== false} /> Active</label>
            <div className="col-span-2 flex gap-2"><Button>Save Course</Button><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button></div>
          </form>
        </section>}
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-xl font-bold">Upload Video</h2>
          <form onSubmit={uploadVideo} className="grid grid-cols-2 gap-4">
            <select className="rounded-md px-3 py-2" value={video.courseId} onChange={(e) => setVideo({ ...video, courseId: e.target.value })} required><option value="">Select course</option>{courses.filter((c) => !c.isBundle).map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}</select>
            <Input label="Video Title" value={video.title} onChange={(e) => setVideo({ ...video, title: e.target.value })} required />
            <input type="file" accept="video/*" onChange={(e) => setVideo({ ...video, file: e.target.files?.[0] })} required />
            <label><input type="checkbox" checked={video.isFreePreview} onChange={(e) => setVideo({ ...video, isFreePreview: e.target.checked })} /> Free preview</label>
            <label className="col-span-2 block rounded-md border border-dashed border-border bg-secondary p-4 text-sm">
              <span className="mb-2 flex items-center gap-2 font-semibold text-gold"><ImagePlus size={18} /> Optional Course Image</span>
              <input type="file" accept="image/*" onChange={(e) => setVideoCourseImage(e.target.files?.[0] || null)} />
              <span className="mt-2 block text-muted">{videoCourseImage ? videoCourseImage.name : 'If skipped, the course thumbnail falls back to the first Bunny video thumbnail.'}</span>
            </label>
            <Button className="col-span-2"><Upload size={16} /> Upload to Bunny</Button>
          </form>
        </section>
      </main>
    </>
  );
}
