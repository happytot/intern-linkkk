'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import InternNav from '../../components/InternNav';
import { Users, User, Mail, Phone, MapPin, Briefcase, GraduationCap, FileText, Wrench, Eye, X } from 'lucide-react';

import './Profile.css';

const STANDARD_DEPARTMENTS = ['CCS', 'CBA', 'CHTM', 'CEA'];

const SectionTitle = ({ icon: Icon, title }) => (
    <h2 className="section-title">
        <Icon size={24} color="var(--primary-orange)" />
        {title}
    </h2>
);

const EducationItem = ({ edu }) => (
    <div className="education-item-grid">
        <div className="edu-input-group">
            <input type="text" value={edu.institution} readOnly />
            <input type="text" value={edu.degree} readOnly />
            <input type="text" value={edu.years} readOnly />
        </div>
    </div>
);

export default function ViewProfile() {
    const supabase = createClientComponentClient();
    const router = useRouter();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                setLoading(false);
                router.push('/auth/internAuthPage');
                return;
            }

            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    const savedDept = data.department || '';
                    const isStandard = STANDARD_DEPARTMENTS.includes(savedDept);

                    const loadedData = {
                        fullName: data.fullname || '',
                        email: user.email || '',
                        phone: data.phone || '',
                        location: data.location || '',
                        summary: data.summary || '',
                        education: data.education ?? [],
                        skills: data.skills || [],
                        profilePicURL: data.profile_pic_url || '',
                        resumeURL: data.resume_url || '',
                        resumeFileName: data.resume_file_name || '',
                        department: isStandard ? savedDept : savedDept,
                    };
                    setProfileData(loadedData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [supabase, router]);

    if (loading) return <p style={{ padding: '40px', textAlign: 'center' }}>Loading...</p>;
    if (!profileData) return <p style={{ padding: '40px', textAlign: 'center' }}>Profile not found.</p>;

    return (
        <div className="profile-wrapper">
            <div className="profile-content-area">
                <div className="page-header-row">
                    <h1 className="page-title">
                        <Users size={32} color="var(--primary-dark)" className="page-title-icon" />
                        View Profile
                    </h1>
                </div>

                <div className="profile-bento-grid">
                    {/* LEFT COLUMN */}
                    <div className="bento-col col-left">
                        <section className="profile-card section-personal-info h-full">
                            <div className="profile-pic-wrapper">
                                <div className="profile-pic-container">
                                    {profileData.profilePicURL ? (
                                        <img src={profileData.profilePicURL} alt="Profile" className="profile-avatar" />
                                    ) : (
                                        <div className="profile-avatar placeholder-avatar">👤</div>
                                    )}
                                </div>
                            </div>
                            <div className="personal-details-stack">
                                <div className="form-group">
                                    <label><User size={16} /> Full Name</label>
                                    <input type="text" value={profileData.fullName} readOnly />
                                </div>
                                <div className="form-group">
                                    <label><Mail size={16} /> Email</label>
                                    <input type="email" value={profileData.email} readOnly />
                                </div>
                                <div className="form-group">
                                    <label><Phone size={16} /> Phone</label>
                                    <input type="text" value={profileData.phone} readOnly />
                                </div>
                                <div className="form-group">
                                    <label><MapPin size={16} /> Location</label>
                                    <input type="text" value={profileData.location} readOnly />
                                </div>
                                <div className="form-group">
                                    <label><Briefcase size={16} /> Department</label>
                                    <input type="text" value={profileData.department} readOnly />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* CENTER COLUMN */}
                    <div className="bento-col col-center">
                        <section className="profile-card section-summary">
                            <SectionTitle icon={Briefcase} title="Professional Summary" />
                            <textarea value={profileData.summary} readOnly />
                        </section>

                        <section className="profile-card section-education flex-grow-card">
                            <SectionTitle icon={GraduationCap} title="Education" />
                            <div className="education-list">
                                {profileData.education.map((edu, idx) => (
                                    <EducationItem key={idx} edu={edu} />
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="bento-col col-right">
                        <section className="profile-card section-resume">
                            <SectionTitle icon={FileText} title="Resume" />
                            {profileData.resumeURL ? (
                                <a href={profileData.resumeURL} target="_blank" rel="noopener noreferrer" className="btn-secondary full-width-btn">
                                    <Eye size={16} /> View Resume
                                </a>
                            ) : (
                                <span>No resume uploaded</span>
                            )}
                        </section>

                        <section className="profile-card section-skills flex-grow-card">
                            <SectionTitle icon={Wrench} title="Key Skills" />
                            <div className="skill-tags">
                                {profileData.skills.map((skill, idx) => (
                                    <div className="skill-badge" key={idx}>{skill}</div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <InternNav />
        </div>
    );
}
