from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from openinference.instrumentation.langchain import LangChainInstrumentor
from core.config import settings

def setup_telemetry():
    """
    Hooks into LangChain/LangGraph to record token usage, latency, 
    and prompt inputs/outputs automatically.
    """
    # 1. Set up the OpenTelemetry Tracer
    tracer_provider = TracerProvider()
    trace.set_tracer_provider(tracer_provider)
    
    # 2. Configure the exporter to send traces to Arize Phoenix
    # BatchSpanProcessor sends data asynchronously so it doesn't slow down the user response
    exporter = OTLPSpanExporter(endpoint=settings.phoenix_collector_endpoint)
    span_processor = BatchSpanProcessor(exporter)
    
    tracer_provider.add_span_processor(span_processor)
    
    # 3. Instrument LangChain
    # This automatically tracks every tool call and LLM generation in your graph
    LangChainInstrumentor().instrument()
    
    print(f"Telemetry initialized. Sending traces to {settings.phoenix_collector_endpoint}")