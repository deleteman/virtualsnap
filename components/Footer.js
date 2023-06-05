import Link from "next/link";


export default function Footer() {
    return (
        <div className="footer">
            <ul className="social-links">
                <li>
                    <Link href="https://twitter.com/virtualsnap_ai">Twitter</Link>
                </li>
                <li>
                    <Link href="https://instagram.com/virtualsnap_ai">Instagram</Link>
                </li>
                <li>
                    <Link href="https://github.com/deleteman/virtualsnap">Github</Link>
                </li>
            </ul>
        </div>
    )
}