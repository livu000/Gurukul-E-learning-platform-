import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";

import {
  getModulesByCourse,
  getLessonsByModule
} from "../services/course.service";

import PageHeader from "../components/common/PageHeader";
import SkeletonCard from "../components/common/SkeletonCard";

import ModuleEditor from "../components/course/ModuleEditor";
import LessonEditor from "../components/course/LessonEditor";
import AddModuleForm from "../components/course/AddModuleForm";
import AddLessonForm from "../components/course/AddLessonForm";

function CourseBuilder() {

  const { courseId } = useParams();

  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     LOAD MODULES
  ========================= */

  const loadModules = useCallback(async () => {

    try {

      const data = await getModulesByCourse(courseId);
      setModules(data || []);

    } catch {

      setError("Failed to load modules");

    } finally {

      setLoading(false);

    }

  }, [courseId]);

  /* =========================
     LOAD MODULES ON PAGE LOAD
  ========================= */

  useEffect(() => {

    loadModules();

  }, [loadModules]);

  /* =========================
     LOAD LESSONS
  ========================= */

  const loadLessons = async (moduleId) => {

    try {

      const data = await getLessonsByModule(moduleId);

      setLessons(prev => ({
        ...prev,
        [moduleId]: data || []
      }));

    } catch {

      setError("Failed to load lessons");

    }

  };

  /* =========================
     TOGGLE MODULE
  ========================= */

  const toggleModule = async (moduleId) => {

    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));

    // Load lessons only first time
    if (!lessons[moduleId]) {
      await loadLessons(moduleId);
    }

  };

  return (

    <div className="page">

      <PageHeader title="Course Builder" />

      {error && <p className="form-error">{error}</p>}

      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className="grid">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* =========================
          MAIN CONTENT
      ========================= */}

      {!loading && (

        <div>

          {/* ADD MODULE */}
          <AddModuleForm
            courseId={courseId}
            refreshModules={loadModules}
          />

          <div className="grid">

            {modules.map(module => (

              <div key={module.id} className="card">

                {/* MODULE HEADER (COLLAPSIBLE) */}
                <h4
                  style={{ cursor: "pointer", marginBottom: 10 }}
                  onClick={() => toggleModule(module.id)}
                >
                  {module.title}{" "}
                  {expandedModules[module.id] ? "▼" : "▶"}
                </h4>

                {/* MODULE EDIT */}
                <ModuleEditor
                  module={module}
                  refreshModules={loadModules}
                />

                {/* LESSONS */}
                {expandedModules[module.id] && (

                  <div style={{ marginTop: 15 }}>

                    {/* LESSON LIST */}
                    {lessons[module.id]?.map(lesson => (

                      <LessonEditor
                        key={lesson.id}
                        lesson={lesson}
                        moduleId={module.id}
                      />

                    ))}

                    {/* ADD LESSON */}
                    <AddLessonForm
                      moduleId={module.id}
                      refreshLessons={() => loadLessons(module.id)}
                    />

                  </div>

                )}

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}

export default CourseBuilder;