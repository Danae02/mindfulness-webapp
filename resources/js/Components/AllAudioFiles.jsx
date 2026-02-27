// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import AudioControl from "@/Components/AudioControl.jsx";
//
// export default function AllAudioFiles() {
//     const [exercises, setExercises] = useState([]);
//
//     useEffect(() => {
//         // Data ophalen van de Laravel backend met Axios
//         axios.get(route('audio.get.all'))
//             .then(response => {
//                 setExercises(response.data); // Data opslaan in de state
//             })
//             .catch(error => {
//                 console.error('Er is een probleem bij het ophalen van de oefeningen:', error);
//             });
//     }, []);
//
//     console.log(exercises)
//
//     return (
//         <div>
//             <h1>All Mindful Courses</h1>
//             <ul>
//                 {exercises.map(exercise => (
//                     <li key={exercise.id}>
//                         <h2>{exercise.exercise_name}</h2>
//                         <AudioControl AudioName={exercise.audio_file_path}/>
//                         </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }
