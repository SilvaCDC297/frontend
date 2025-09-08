export default function Footer() {
  return (
    <footer className="text-white-50 py-4 bg-dark">
      <div className="container text-center">
        <div>Contacto: info@jobconnectestgv.com</div>
        <div className="d-flex justify-content-center gap-3 mt-2">
          <a href="#" className="text-lime"><i className="bi bi-google"></i></a>
          <a href="#" className="text-lime"><i className="bi bi-facebook"></i></a>
          <a href="#" className="text-lime"><i className="bi bi-linkedin"></i></a>
        </div>
        <div className="mt-2 small">YourBank - Todos os direitos reservados. Política de Privacidade | Termos de Serviço</div>
      </div>
    </footer>
  );
}