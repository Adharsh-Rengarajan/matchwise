import styles from '../styles/footer.module.css'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerLogo}>MatchWise</h3>
            <p className={styles.footerTagline}>
              Finding meaningful connections through intelligent matching
            </p>
          </div>
          <div className={styles.footerSection}>
            <h4 className={styles.footerHeading}>Product</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#testimonials">Success Stories</a></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4 className={styles.footerHeading}>Company</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4 className={styles.footerHeading}>Legal</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#safety">Safety</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2024 MatchWise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer