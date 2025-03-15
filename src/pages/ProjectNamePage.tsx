import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectNamePage.css";

function ProjectNamePage() {
    const [projectName, setProjectName] = useState("");
    const navigate = useNavigate();

    const handleProjectNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(event.target.value);
    };

    const handleSubmit = () => {
        if (projectName.trim() === "") {
            alert("Choose a project name");
            return;
        }
        navigate("/select-structure", { state: { projectName } });
    };

    return (
        <div className="project-name-container">
            <h1 className="project-name-title">Choose a project name</h1>
            <input
                type="text"
                className="project-name-input"
                value={projectName}
                onChange={handleProjectNameChange}
                placeholder="Project name"
            />
            <button className="project-name-submit-button" onClick={handleSubmit}>
                Continue
            </button>
        </div>
    );
}

export default ProjectNamePage;
