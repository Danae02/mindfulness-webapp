@extends('layouts.app')

@section('content')
<div style="text-align: center; padding: 4rem;">
    <h1>Sessie verlopen</h1>
    <p>Je sessie is verlopen. Ga terug en probeer het opnieuw.</p>
    <a href="{{ url()->previous() }}">← Ga terug</a>
</div>
@endsection
