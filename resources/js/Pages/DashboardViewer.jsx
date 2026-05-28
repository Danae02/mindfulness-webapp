import React, { useEffect, useState } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import ProfileOverview from "@/Components/ProfileOverview.jsx";
import CourseList from "@/Components/CourseList.jsx";
import AccessibilityButton from "@/Components/AccessibilityButton";
import NextExerciseBanner from "@/Components/Nextexercisebanner.jsx";

export default function DashboardViewer({ exerciseCountLastWeek, nextExercise, completedTodayIds }) {
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [coursesError, setCoursesError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            setCoursesLoading(true);
            setCoursesError(null);
            try {
                const response = await axios.get(route('courses.get.all'));
                setCourses(response.data);
            } catch (err) {
                console.error('Fout:', err);
                setCoursesError('Kon cursussen niet laden');
            } finally {
                setCoursesLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleFetchCourseDetails = async (courseId) => {
        const response = await axios.get(route('courses.details', { id: courseId }));
        return response.data;
    };

    return (
        <AuthenticatedLayout
            topBar={
                <div className="w-full py-3 border-t-2 border-b-2" style={{ backgroundColor: '#F0E8FF', borderTopColor: '#000000', borderBottomColor: '#000000' }}>
                    <div className="flex justify-end px-4 sm:px-6 lg:px-8">
                        <AccessibilityButton variant="plain" />
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Viewer" />

            <section className="pt-4 pb-8 bg-lightGray">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="w-full bg-white rounded-xl p-4 sm:p-8" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #5F5F5F' }}>
                        <ProfileOverview exerciseCountLastWeek={exerciseCountLastWeek} />
                    </div>
                </div>
            </section>

            <section className="pb-12 bg-lightGray">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="w-full bg-white rounded-xl p-4 sm:p-8" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #5F5F5F' }}>
                        <NextExerciseBanner nextExercise={nextExercise} completedTodayIds={completedTodayIds} />
                        {coursesError && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{coursesError}</div>}
                        <CourseList courses={courses} loading={coursesLoading} error={coursesError} onFetchCourseDetails={handleFetchCourseDetails} />
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
