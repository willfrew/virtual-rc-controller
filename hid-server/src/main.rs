use actix_web::{web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;

mod reports;
mod ws_device;

use crate::ws_device::WsControllerActor;

async fn ws_handler(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let resp = ws::start(WsControllerActor::new()?, &req, stream);
    println!("{:?}", resp);
    resp
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().route("/ws", web::get().to(ws_handler)))
        .bind("0.0.0.0:8080")?
        .run()
        .await
}
