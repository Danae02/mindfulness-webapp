export default function ApplicationLogo({ alt = "Affect-us logo", ...props }) {
    return (
        <img
            {...props}
            alt={alt}
            src="https://affect-us.nl/website/wp-content/uploads/2024/02/Affect-us-beeld.png"
        />
    );
}
