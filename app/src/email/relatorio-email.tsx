import {
  Text,
  Heading,
  Container,
  Section,
  Body,
  Html,
} from "@react-email/components";
import * as React from "react";

export default function Relatorio() {
  return (
    <Html>
      <Body
        style={{
          backgroundColor: "#F6FDFF",
          fontFamily: "Poppins, sans-serif",
          color: "#1D4C5A",
          padding: "20px",
        }}
      >
        <Container>
          <Section>
            <Heading style={{ color: "#27a338" }} as="h1">
              Prezado(a),
            </Heading>
            <Text>
              Segue em anexo o relatório de manutenções de sua oficina.
            </Text>
            
            <Text>
              Agradecemos pela preferência em utilizar nossos serviços!
            </Text>
            <Text>Atenciosamente,</Text>
          </Section>

          <Section style={{ textAlign: "center", marginTop: "40px" }}>
            <Text
              style={{
                margin: "8px 0",
                fontWeight: "600",
                fontSize: "16px",
                color: "#27a338",
                lineHeight: "24px",
              }}
            >
              Equipe Carro em Dados
            </Text>
            <Text
              style={{
                margin: "4px 0",
                fontSize: "16px",
                color: "#64748B",
                lineHeight: "24px",
              }}
            >
              A startup que faz manutenção automotiva em tempo real
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
